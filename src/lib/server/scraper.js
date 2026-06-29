const axios = require('axios');
const cheerio = require('cheerio');
const { getCachedData, setCachedData } = require('./firebase');

const BASE_URL = 'https://anichin.moe';
const PROXY_BASE = process.env.PROXY_URL || '';

const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
];

function pickUA() { return UA_LIST[Math.floor(Math.random() * UA_LIST.length)]; }

function makeHeaders() {
  return {
    'User-Agent': pickUA(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Sec-Ch-Ua': '"Chromium";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };
}

function parseHtml(html) {
  if (!html || typeof html !== 'string') return null;
  if (html.includes('challenge-platform') || html.length < 500) return null;
  try { return cheerio.load(html); } catch { return null; }
}

async function directFetch(url) {
  try {
    const { data } = await axios.get(url, { headers: makeHeaders(), timeout: 12000, maxRedirects: 5 });
    return parseHtml(data);
  } catch { return null; }
}

async function proxyFetch(url) {
  if (!PROXY_BASE) return null;
  try {
    const { data } = await axios.get(`${PROXY_BASE}?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': pickUA() }, timeout: 18000,
    });
    return parseHtml(data);
  } catch { return null; }
}

async function fetchPage(url) {
  return await proxyFetch(url) || await directFetch(url);
}

function extractItem($, el) {
  const $el = $(el);
  const link = $el.find('a').first();
  const title = link.attr('title') || $el.find('h2').first().text().trim() || '';
  const url = link.attr('href') || '';
  const slug = url.replace(/^\//, '').replace(/\/$/, '');
  const thumbnail = $el.find('img').attr('src') || '';
  const episode = $el.find('.epx').text().trim();
  const type = $el.find('.typez').text().trim().split(' ')[0] || '';
  const epMatch = episode.match(/(\d+)/);
  return { title, slug, thumbnail, episode, episodeNum: epMatch ? epMatch[1] : '', type, url };
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

async function scrapeListPage(url) {
  const $ = await fetchPage(url);
  if (!$) return [];
  const results = [];
  $('article.bs').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) results.push(item);
  });
  return results;
}

function parseSchedule($) {
  const schedule = [];
  const dayMap = {
    'Senin': 'Senin', 'Selasa': 'Selasa', 'Rabu': 'Rabu', 'Kamis': 'Kamis',
    "Jum'at": "Jum'at", 'Jumat': "Jum'at", 'Sabtu': 'Sabtu', 'Minggu': 'Minggu',
    'Acak': 'Acak', 'Random': 'Acak',
  };

  $('.listSchh').each((_, el) => {
    const $el = $(el);
    const dayName = $el.find('h2').first().text().trim();
    const mappedDay = dayMap[dayName] || dayName;
    const items = [];
    $el.find('.subSchh a').each((_, a) => {
      const title = $(a).text().trim();
      const slug = ($(a).attr('href') || '').replace(/^\//, '').replace(/\/$/, '');
      if (title && slug) items.push({ title, slug });
    });
    if (items.length > 0) schedule.push({ name: mappedDay, items });
  });

  return schedule;
}

async function getHomeAnime() {
  const $ = await fetchPage(BASE_URL);
  if (!$) {
    const cached = await getCachedData('anime/home');
    if (cached?.data?.popular?.length > 0) return cached.data;
    return { popular: [], ongoing: [], schedule: [], hero: [] };
  }

  const popular = dedupe($('.popularslider .bs').toArray().map(el => extractItem($, el)).filter(i => i.title && i.slug));
  const ongoing = dedupe($('.ongoing .bs, .section-ongoing .bs').toArray().map(el => extractItem($, el)).filter(i => i.title && i.slug));
  const schedule = parseSchedule($);

  // Hero slides: top 5 popular with their thumbnails
  const hero = popular.slice(0, 5).map(item => ({
    title: item.title,
    slug: item.slug,
    thumbnail: item.thumbnail,
    synopsis: '',
  }));

  const result = { popular, ongoing, schedule, hero };
  if (result.popular.length > 0) {
    await setCachedData('anime/home', result, 5 * 60 * 1000);
  }
  return result;
}

async function getOngoingAnime(page = 1) {
  const cacheKey = `anime/ongoing/${page}`;
  // Short cache (5 min) for freshness
  const cached = await getCachedData(cacheKey);
  if (cached?.data?.length > 0) return cached.data;

  const url = page === 1 ? `${BASE_URL}/ongoing/` : `${BASE_URL}/ongoing/page/${page}/`;
  const results = await scrapeListPage(url);

  if (results.length > 0) {
    await setCachedData(cacheKey, results, 5 * 60 * 1000);
  }
  return results;
}

async function getCompletedAnime(page = 1) {
  const cacheKey = `anime/completed/${page}`;
  const cached = await getCachedData(cacheKey);
  if (cached?.data?.length > 0) return cached.data;

  const url = page === 1 ? `${BASE_URL}/completed/` : `${BASE_URL}/completed/page/${page}/`;
  const results = await scrapeListPage(url);

  if (results.length > 0) {
    await setCachedData(cacheKey, results, 5 * 60 * 1000);
  }
  return results;
}

async function searchAnime(query) {
  // Always scrape live from anichin search
  const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
  const $ = await fetchPage(searchUrl);
  if (!$) {
    // Fallback to Firebase index if live search fails
    const indexCache = await getCachedData('search/index');
    if (indexCache?.data?.length > 0) {
      const q = query.toLowerCase();
      return dedupe(indexCache.data.filter(item =>
        item.title.toLowerCase().includes(q)
      )).slice(0, 30);
    }
    return [];
  }

  const results = [];
  // anichin search results are in .bs or .bsx elements
  $('article.bs, .bsx').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) results.push(item);
  });

  // Also try .listupd .bs pattern
  if (results.length === 0) {
    $('.listupd .bs, .bigtitle .bs').each((_, el) => {
      const item = extractItem($, el);
      if (item.title && item.slug) results.push(item);
    });
  }

  return dedupe(results).slice(0, 30);
}

async function suggestAnime(query) {
  // Suggest from live search (first 8 results)
  const results = await searchAnime(query);
  return results.slice(0, 8).map(item => ({
    title: item.title,
    slug: item.slug,
    thumbnail: item.thumbnail,
    type: item.type,
  }));
}

async function getAnimeByGenre(genre, page = 1) {
  const url = page === 1
    ? `${BASE_URL}/genres/${encodeURIComponent(genre)}/`
    : `${BASE_URL}/genres/${encodeURIComponent(genre)}/page/${page}/`;
  const $ = await fetchPage(url);
  if (!$) return [];

  const results = [];
  $('article.bs, .bsx').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) results.push(item);
  });

  if (results.length === 0) {
    $('.listupd .bs, .bigtitle .bs').each((_, el) => {
      const item = extractItem($, el);
      if (item.title && item.slug) results.push(item);
    });
  }

  return dedupe(results);
}

async function getAnimeDetail(slug) {
  const cached = await getCachedData(`anime/detail/${slug}`);
  if (cached?.data?.title) return cached.data;

  let $ = await fetchPage(`${BASE_URL}/${slug}/`);
  if (!$) return null;

  const title = $('h1.entry-title, h1').first().text().trim();
  const pageHtml = $.html();
  const isEpisodePage = pageHtml.includes('player-embed') || (pageHtml.includes('iframe') && slug.includes('episode'));

  let seriesSlug = slug;
  if (isEpisodePage) {
    for (const href of $('.bixbox').first().find('a[href]').toArray().map(e => $(e).attr('href'))) {
      const m = href?.match(/^\/([^/]+)\/$/);
      if (m && m[1] !== slug && !m[1].includes('episode')) { seriesSlug = m[1]; break; }
    }
  }

  let $series = $;
  if (seriesSlug !== slug) {
    const $f = await fetchPage(`${BASE_URL}/${seriesSlug}/`);
    if ($f) {
      const t = $f('h1.entry-title, h1').first().text().trim();
      if (t && !t.includes('Anichin')) $series = $f;
    }
  }

  const info = {};
  $series('.spe span').each((_, el) => {
    const $el = $series(el);
    const k = $el.find('b').text().trim().toLowerCase().replace(':', '').replace(/\s+/g, '');
    const v = $el.text().replace($el.find('b').text(), '').trim();
    if (k && v) info[k] = v;
  });

  const genres = [];
  $series('.genxed a[href*="genre"]').each((_, el) => {
    const g = $series(el).text().trim();
    if (g && !genres.includes(g)) genres.push(g);
  });

  const episodes = [];
  $series('.eplister ul li').each((_, el) => {
    const $el = $series(el);
    const epNum = $el.find('.epl-num').text().trim();
    const epTitle = $el.find('.epl-title').text().trim();
    const epUrl = $el.find('a').first().attr('href') || '';
    const epDate = $el.find('.epl-date').text().trim();
    if (epNum || epTitle) {
      episodes.push({ title: epTitle, number: parseInt(epNum) || 0, url: epUrl, date: epDate });
    }
  });

  const result = {
    title: $series('h1.entry-title, h1').first().text().trim() || title,
    slug: seriesSlug,
    thumbnail: $series('.thumb img, .bigor img, .wp-post-image').first().attr('src') || '',
    synopsis: $series('.desc p, .entry-content p, .sinopsis p').first().text().trim(),
    info, genres, episodes,
  };

  if (result.title) {
    await setCachedData(`anime/detail/${slug}`, result, 60 * 60 * 1000);
  }
  return result;
}

function extractIframeHtml(base64Html) {
  try { return Buffer.from(base64Html, 'base64').toString('utf8'); } catch { return ''; }
}

function extractIframeSrc(base64Html) {
  const html = extractIframeHtml(base64Html);
  const m = html.match(/src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

const PREMIUM_SERVERS = ['4k', '4kui', 'wafilm', 'wibufiles', 'sextimax', 'hls', 'vidhide', 'filelions', 'streamtape'];

function isPremiumServer(name) {
  const lower = name.toLowerCase();
  return PREMIUM_SERVERS.some(p => lower.includes(p));
}

async function resolveDirectUrl(embedUrl) {
  if (!embedUrl || !embedUrl.startsWith('http')) return null;
  try {
    const { data: html } = await axios.get(embedUrl, {
      headers: { ...makeHeaders(), Referer: embedUrl },
      timeout: 10000,
      maxRedirects: 5,
    });
    if (!html || typeof html !== 'string') return null;

    // Try to extract m3u8 URLs
    const m3u8Match = html.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/i);
    if (m3u8Match) return { url: m3u8Match[1], type: 'hls' };

    // Try to extract mp4 URLs
    const mp4Match = html.match(/["'](https?:\/\/[^"'\s]+\.mp4[^"'\s]*)["']/i);
    if (mp4Match) return { url: mp4Match[1], type: 'mp4' };

    // Try file:"..." pattern (common in streaming embeds)
    const fileMatch = html.match(/file\s*[:=]\s*["'](https?:\/\/[^"'\s]+)["']/i);
    if (fileMatch) {
      const ext = fileMatch[1].match(/\.(m3u8|mp4|mkv)/i);
      return { url: fileMatch[1], type: ext ? ext[1].toLowerCase() : 'mp4' };
    }

    // Try source:"..." pattern
    const sourceMatch = html.match(/source\s*[:=]\s*["'](https?:\/\/[^"'\s]+)["']/i);
    if (sourceMatch) {
      const ext = sourceMatch[1].match(/\.(m3u8|mp4|mkv)/i);
      return { url: sourceMatch[1], type: ext ? ext[1].toLowerCase() : 'mp4' };
    }

    return null;
  } catch {
    return null;
  }
}

async function getEpisodeServers(episodeUrl) {
  const $ = await fetchPage(episodeUrl);
  if (!$) return [];
  const servers = [];
  $('select.mirror option').each((_, el) => {
    const $el = $(el);
    const name = $el.text().trim();
    const value = $el.attr('value') || '';
    if (!name || !value || name === 'Pilih Server Video') return;
    const iframeUrl = extractIframeSrc(value);
    servers.push({
      name,
      url: iframeUrl,
      embed: extractIframeHtml(value),
      premium: isPremiumServer(name),
    });
  });
  return servers;
}

async function getEpisodeStream(episodeUrl) {
  const $ = await fetchPage(episodeUrl);
  if (!$) return null;
  const servers = await getEpisodeServers(episodeUrl);

  // Try to resolve direct URLs for each server (in parallel, first 3)
  const toResolve = servers.slice(0, 3);
  const resolved = await Promise.allSettled(
    toResolve.map(s => resolveDirectUrl(s.url))
  );

  resolved.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      servers[i].directUrl = r.value.url;
      servers[i].directType = r.value.type;
    }
  });

  let videoUrl = servers[0]?.directUrl || servers[0]?.url || $('iframe').first().attr('src') || '';
  return { videoUrl, servers };
}

module.exports = { getHomeAnime, searchAnime, suggestAnime, getAnimeDetail, getEpisodeServers, getEpisodeStream, getOngoingAnime, getCompletedAnime, getAnimeByGenre };
