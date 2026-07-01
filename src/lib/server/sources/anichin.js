const axios = require('axios');
const cheerio = require('cheerio');

// Priority order: .moe has full content, others may be empty/placeholder
const MIRRORS = [
  'https://anichin.moe',
  'https://anichin.cafe',
  'https://anichin.best',
];

const LANDING_PAGES = [
  'https://anichin.care',
  'https://anichin.team',
];

const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
];

// Always start with moe — it has full content
let activeBaseUrl = MIRRORS[0];

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
  // Reject only if it's entirely a challenge page (no real content)
  if (html.length < 500) return null;
  if (html.includes('Just a moment') && html.length < 5000) return null;
  try { return cheerio.load(html); } catch { return null; }
}

async function resolveActiveDomain() {
  for (const landing of LANDING_PAGES) {
    try {
      const { data } = await axios.get(landing, {
        headers: makeHeaders(),
        timeout: 8000,
        maxRedirects: 3,
      });
      // Extract redirect URL from meta refresh or countdown page
      const m = data.match(/https?:\/\/anichin\.\w+/i);
      if (m) {
        const domain = m[0].replace(/\/$/, '');
        if (MIRRORS.includes(domain) || !domain.includes('care') && !domain.includes('team')) {
          return domain;
        }
      }
    } catch {}
  }
  return null;
}

async function getBaseUrl() {
  // Always return moe as primary — it has full content
  return MIRRORS[0];
}

async function directFetch(url) {
  try {
    const { data } = await axios.get(url, { headers: makeHeaders(), timeout: 12000, maxRedirects: 5 });
    return parseHtml(data);
  } catch { return null; }
}

async function fetchPage(url) {
  // Try all mirrors in parallel — return the first that succeeds
  const results = await Promise.allSettled(
    MIRRORS.map(async (mirror) => {
      const fullUrl = url.startsWith('http') ? url.replace(/https?:\/\/[^\/]+/, mirror) : `${mirror}${url}`;
      const $ = await directFetch(fullUrl);
      if ($) return { mirror, $ };
      throw new Error('empty');
    })
  );
  const ok = results.find(r => r.status === 'fulfilled' && r.value);
  if (ok) {
    activeBaseUrl = ok.value.mirror;
    return ok.value.$;
  }
  return null;
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

async function getHome() {
  const base = await getBaseUrl();
  const $ = await fetchPage(base);
  if (!$) return null;

  const popular = dedupe($('.popularslider .bs').toArray().map(el => extractItem($, el)).filter(i => i.title && i.slug));
  const ongoing = dedupe($('.ongoing .bs, .section-ongoing .bs').toArray().map(el => extractItem($, el)).filter(i => i.title && i.slug));
  const schedule = parseSchedule($);
  const hero = popular.slice(0, 5).map(item => ({
    title: item.title,
    slug: item.slug,
    thumbnail: item.thumbnail,
    synopsis: '',
  }));

  return { popular, ongoing, schedule, hero, source: 'anichin' };
}

async function getAnimeDetail(slug) {
  // First try as series page
  let $ = await fetchPage(`/${slug}/`);
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
    const $f = await fetchPage(`/${seriesSlug}/`);
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

  const thumbnail = $series('.thumb img, .bigor img, .wp-post-image').first().attr('src') || '';
  const synopsis = $series('.desc p, .entry-content p, .sinopsis p').first().text().trim();

  return {
    title: $series('h1.entry-title, h1').first().text().trim() || title,
    slug: seriesSlug,
    thumbnail,
    synopsis,
    info, genres, episodes,
    type: 'donghua',
    source: 'anichin',
  };
}

const PREMIUM_SERVERS = ['4k', '4kui', 'wafilm', 'wibufiles', 'sextimax', 'hls', 'vidhide', 'filelions', 'streamtape', 'uqload'];

function isPremiumServer(name) {
  const lower = name.toLowerCase();
  return PREMIUM_SERVERS.some(p => lower.includes(p));
}

function cleanEmbedUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    const adParams = ['ads', 'ad', 'popup', 'popunder', 'target', 'click', 'subid', 'sub_id'];
    adParams.forEach(p => u.searchParams.delete(p));
    u.searchParams.delete('redirect');
    u.searchParams.delete('next');
    return u.toString();
  } catch {
    return url;
  }
}

function extractIframeHtml(base64Html) {
  try { return Buffer.from(base64Html, 'base64').toString('utf8'); } catch { return ''; }
}

function extractIframeSrc(base64Html) {
  const html = extractIframeHtml(base64Html);
  const m = html.match(/src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

async function resolveDirectUrl(embedUrl) {
  if (!embedUrl || !embedUrl.startsWith('http')) return null;
  try {
    const { data: html } = await axios.get(embedUrl, {
      headers: { ...makeHeaders(), Referer: embedUrl },
      timeout: 10000, maxRedirects: 5,
    });
    if (!html || typeof html !== 'string') return null;

    const m3u8Match = html.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/i);
    if (m3u8Match) return { url: m3u8Match[1], type: 'hls' };

    const mp4Match = html.match(/["'](https?:\/\/[^"'\s]+\.mp4[^"'\s]*)["']/i);
    if (mp4Match) return { url: mp4Match[1], type: 'mp4' };

    const fileMatch = html.match(/file\s*[:=]\s*["'](https?:\/\/[^"'\s]+)["']/i);
    if (fileMatch) {
      const ext = fileMatch[1].match(/\.(m3u8|mp4|mkv)/i);
      return { url: fileMatch[1], type: ext ? ext[1].toLowerCase() : 'mp4' };
    }

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
      url: cleanEmbedUrl(iframeUrl),
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

  const resolved = await Promise.allSettled(
    servers.map(s => resolveDirectUrl(s.url))
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

async function searchAnime(query) {
  const base = await getBaseUrl();
  const searchUrl = `${base}/?s=${encodeURIComponent(query)}`;
  const $ = await fetchPage(searchUrl);
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

  return dedupe(results).slice(0, 30).map(r => ({ ...r, type: 'donghua', source: 'anichin' }));
}

async function suggestAnime(query) {
  const results = await searchAnime(query);
  return results.slice(0, 8).map(item => ({
    title: item.title, slug: item.slug, thumbnail: item.thumbnail, type: item.type,
  }));
}

async function getOngoingAnime(page = 1) {
  const base = await getBaseUrl();
  const url = page === 1 ? `${base}/ongoing/` : `${base}/ongoing/page/${page}/`;
  const $ = await fetchPage(url);
  if (!$) return [];
  const results = [];
  $('article.bs').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) results.push(item);
  });
  return results;
}

async function getCompletedAnime(page = 1) {
  const base = await getBaseUrl();
  const url = page === 1 ? `${base}/completed/` : `${base}/completed/page/${page}/`;
  const $ = await fetchPage(url);
  if (!$) return [];
  const results = [];
  $('article.bs').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) results.push(item);
  });
  return results;
}

async function getAnimeByGenre(genre, page = 1) {
  const base = await getBaseUrl();
  const url = page === 1
    ? `${base}/genres/${encodeURIComponent(genre)}/`
    : `${base}/genres/${encodeURIComponent(genre)}/page/${page}/`;
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

module.exports = {
  name: 'anichin',
  getHome,
  getAnimeDetail,
  getEpisodeServers,
  getEpisodeStream,
  searchAnime,
  suggestAnime,
  getOngoingAnime,
  getCompletedAnime,
  getAnimeByGenre,
  resolveActiveDomain,
};
