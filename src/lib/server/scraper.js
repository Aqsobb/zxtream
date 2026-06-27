const axios = require('axios');
const cheerio = require('cheerio');
const { getFreshOrCached } = require('./firebase');

const BASE_URL = 'https://anichin.moe';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Referer': BASE_URL,
};

const inMemoryCache = new Map();
const MEMORY_TTL = 2 * 60 * 1000;

function getMemCache(key) {
  const item = inMemoryCache.get(key);
  if (item && Date.now() - item.ts < MEMORY_TTL) return item.data;
  return null;
}

function setMemCache(key, data) {
  inMemoryCache.set(key, { data, ts: Date.now() });
}

async function fetchPage(url) {
  const memCached = getMemCache(url);
  if (memCached) return memCached;

  try {
    const { data } = await axios.get(url, { headers, timeout: 15000 });
    const $ = cheerio.load(data);
    setMemCache(url, $);
    return $;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
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
  const episodeNum = epMatch ? epMatch[1] : '';

  return { title, slug, thumbnail, episode, episodeNum, type, url };
}

async function getHomeAnime() {
  return getFreshOrCached('anime/home', async () => {
    const $ = await fetchPage(BASE_URL);
    if (!$) return { popular: [], recent: [] };

    const popular = [];
    $('.popularslider .bs, .slider .bs').each((_, el) => {
      const item = extractItem($, el);
      if (item.title && item.slug) popular.push(item);
    });

    const recent = [];
    $('.normal .bs, .postbody .bs').each((_, el) => {
      const item = extractItem($, el);
      if (item.title && item.slug) recent.push(item);
    });

    return { popular, recent };
  }, 15 * 60 * 1000);
}

async function searchAnime(query) {
  const cacheKey = `search/${query}`;
  return getFreshOrCached(cacheKey, async () => {
    const $ = await fetchPage(`${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`);
    if (!$) return [];

    const results = [];
    $('.listupd .bs, .bs').each((_, el) => {
      const item = extractItem($, el);
      if (item.title && item.slug) results.push(item);
    });

    return results;
  }, 10 * 60 * 1000);
}

async function getAnimeDetail(slug) {
  const cacheKey = `anime/detail/${slug}`;
  return getFreshOrCached(cacheKey, async () => {
    let $ = await fetchPage(`${BASE_URL}/${slug}/`);
    if (!$) return null;

    const title = $('h1.entry-title, h1').first().text().trim();
    const pageHtml = $.html();
    const isEpisodePage = pageHtml.includes('player-embed') || pageHtml.includes('iframe') && slug.includes('episode');

    let seriesSlug = slug;
    if (isEpisodePage) {
      const allLinks = [];
      $('.bixbox').first().find('a[href]').each((_, el) => {
        allLinks.push($(el).attr('href'));
      });
      for (const href of allLinks) {
        const m = href.match(/^\/([^/]+)\/$/);
        if (m && m[1] !== slug && !m[1].includes('episode')) {
          seriesSlug = m[1];
          break;
        }
      }
    }

    let $series = $;
    if (seriesSlug !== slug) {
      const $fetched = await fetchPage(`${BASE_URL}/${seriesSlug}/`);
      if ($fetched) {
        const seriesTitle = $fetched('h1.entry-title, h1').first().text().trim();
        if (seriesTitle && !seriesTitle.includes('Anichin')) {
          $series = $fetched;
        }
      }
    }

    const seriesTitle = $series('h1.entry-title, h1').first().text().trim();
    const thumbnail = $series('.thumb img, .bigor img, .wp-post-image').first().attr('src') || '';
    const synopsis = $series('.desc p, .entry-content p, .sinopsis p').first().text().trim();

    const info = {};
    $series('.spe span').each((_, el) => {
      const $el = $series(el);
      const bText = $el.find('b').text().trim().toLowerCase().replace(':', '').replace(/\s+/g, '');
      const value = $el.text().replace($el.find('b').text(), '').trim();
      if (bText && value) info[bText] = value;
    });

    const genres = [];
    $series('.genxed a[href*="genre"]').each((_, el) => {
      const g = $series(el).text().trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    const episodes = [];
    $series('.eplister ul li').each((_, el) => {
      const $el = $series(el);
      const link = $el.find('a').first();
      const epNum = $el.find('.epl-num').text().trim();
      const epTitle = $el.find('.epl-title').text().trim();
      const epUrl = link.attr('href') || '';
      const epDate = $el.find('.epl-date').text().trim();

      if (epNum || epTitle) {
        episodes.push({
          title: epTitle,
          number: parseInt(epNum) || 0,
          url: epUrl,
          date: epDate,
        });
      }
    });

    return {
      title: seriesTitle || title,
      slug: seriesSlug,
      thumbnail,
      banner: thumbnail,
      synopsis,
      info,
      genres,
      episodes,
      type: info.tipe || '',
      status: info.status || '',
      releaseYear: parseInt(info.released || '0') || 0,
      duration: info.durasi || '',
      rating: info.rating || '',
      studio: info.studio || '',
    };
  }, 15 * 60 * 1000);
}

function extractIframeHtml(base64Html) {
  try {
    return Buffer.from(base64Html, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function extractIframeSrc(base64Html) {
  const html = extractIframeHtml(base64Html);
  const srcMatch = html.match(/src=["']([^"']+)["']/i);
  return srcMatch ? srcMatch[1] : '';
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

    const iframeHtml = extractIframeHtml(value);
    const streamUrl = extractIframeSrc(value);
    servers.push({ name, url: streamUrl, embed: iframeHtml });
  });

  return servers;
}

async function getEpisodeStream(episodeUrl) {
  const cacheKey = `episode/stream/${episodeUrl}`;
  return getFreshOrCached(cacheKey, async () => {
    const $ = await fetchPage(episodeUrl);
    if (!$) return null;

    const servers = await getEpisodeServers(episodeUrl);

    let videoUrl = '';
    if (servers.length > 0) {
      videoUrl = servers[0].url;
    }

    if (!videoUrl) {
      const iframeSrc = $('iframe').first().attr('src') || '';
      if (iframeSrc) videoUrl = iframeSrc;
    }

    return { videoUrl, servers };
  }, 10 * 60 * 1000);
}

module.exports = {
  getHomeAnime,
  searchAnime,
  getAnimeDetail,
  getEpisodeServers,
  getEpisodeStream,
};
