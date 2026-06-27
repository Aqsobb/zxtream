const axios = require('axios');
const cheerio = require('cheerio');
const { getCachedData, setCachedData } = require('./firebase');

const BASE_URL = 'https://anichin.moe';
const PROXY_BASE = process.env.PROXY_URL || '';

const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
];

function pickUA() {
  return UA_LIST[Math.floor(Math.random() * UA_LIST.length)];
}

function makeHeaders() {
  return {
    'User-Agent': pickUA(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Sec-Ch-Ua': '"Chromium";v="126", "Not/A)Brand";v="8", "Google Chrome";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Linux"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive',
  };
}

function parseHtml(html) {
  if (!html || typeof html !== 'string') return null;
  const dominated = html.includes('challenge-platform') || html.includes('cf-browser-verification');
  if (dominated) return null;
  if (html.length < 500) return null;
  try { return cheerio.load(html); } catch { return null; }
}

async function directFetch(url, retryCount = 0) {
  try {
    const { data } = await axios.get(url, {
      headers: makeHeaders(),
      timeout: 12000,
      maxRedirects: 5,
    });
    return parseHtml(data);
  } catch (e) {
    if (retryCount < 1) {
      await new Promise(r => setTimeout(r, 500));
      return directFetch(url, retryCount + 1);
    }
    return null;
  }
}

async function proxyFetch(url) {
  if (!PROXY_BASE) return null;
  try {
    const proxyUrl = `${PROXY_BASE}?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(proxyUrl, {
      headers: { 'User-Agent': pickUA() },
      timeout: 18000,
    });
    return parseHtml(data);
  } catch {
    return null;
  }
}

async function fetchPage(url) {
  const $1 = await proxyFetch(url);
  if ($1) return $1;
  const $2 = await directFetch(url);
  if ($2) return $2;
  console.error(`All fetch methods failed: ${url}`);
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

async function getHomeAnime() {
  const cached = await getCachedData('anime/home');
  if (cached?.data?.popular?.length > 0) return cached.data;

  const $ = await fetchPage(BASE_URL);
  if (!$) return { popular: [], recent: [] };

  const popular = [];
  $('.popularslider .bs').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) popular.push(item);
  });
  const recent = [];
  $('.normal .bs').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) recent.push(item);
  });

  const result = { popular, recent };
  if (result.popular.length > 0) {
    await setCachedData('anime/home', result, 30 * 60 * 1000);
  }
  return result;
}

async function searchAnime(query) {
  const cached = await getCachedData(`search/${query}`);
  if (cached?.data?.length > 0) return cached.data;

  const indexCache = await getCachedData('search/index');
  if (indexCache?.data?.length > 0) {
    const q = query.toLowerCase();
    const results = indexCache.data.filter(item =>
      item.title.toLowerCase().includes(q)
    ).slice(0, 30);
    if (results.length > 0) {
      await setCachedData(`search/${query}`, results, 15 * 60 * 1000);
    }
    return results;
  }

  const results = [];
  const q = query.toLowerCase();
  for (let page = 1; page <= 3 && results.length === 0; page++) {
    const url = page === 1 ? `${BASE_URL}/anime/` : `${BASE_URL}/anime/page/${page}/`;
    const $ = await fetchPage(url);
    if (!$) break;
    $('article.bs').each((_, el) => {
      const $el = $(el);
      const link = $el.find('a').first();
      const title = (link.attr('title') || $el.find('h2').first().text().trim() || '').toLowerCase();
      if (title.includes(q)) results.push(extractItem($, el));
    });
  }

  if (results.length > 0) {
    await setCachedData(`search/${query}`, results, 15 * 60 * 1000);
  }
  return results;
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

async function getEpisodeServers(episodeUrl) {
  const $ = await fetchPage(episodeUrl);
  if (!$) return [];
  const servers = [];
  $('select.mirror option').each((_, el) => {
    const $el = $(el);
    const name = $el.text().trim();
    const value = $el.attr('value') || '';
    if (!name || !value || name === 'Pilih Server Video') return;
    servers.push({ name, url: extractIframeSrc(value), embed: extractIframeHtml(value) });
  });
  return servers;
}

async function getEpisodeStream(episodeUrl) {
  const $ = await fetchPage(episodeUrl);
  if (!$) return null;
  const servers = await getEpisodeServers(episodeUrl);
  let videoUrl = servers[0]?.url || $('iframe').first().attr('src') || '';
  return { videoUrl, servers };
}

module.exports = { getHomeAnime, searchAnime, getAnimeDetail, getEpisodeServers, getEpisodeStream };
