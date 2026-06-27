const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://anichin.moe';
const WORKER_URL = 'https://api.aqsobonde.workers.dev';
const DB_URL = process.env.FIREBASE_DB_URL;
const API_KEY = process.env.FIREBASE_API_KEY;

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function authUrl(path) {
  const sep = path.includes('?') ? '&' : '?';
  return API_KEY ? `${DB_URL}/${path}.json?auth=${API_KEY}` : `${DB_URL}/${path}.json`;
}

async function fetchPage(url) {
  const urls = [
    `${WORKER_URL}?url=${encodeURIComponent(url)}`,
    url,
  ];
  for (const fetchUrl of urls) {
    try {
      const { data } = await axios.get(fetchUrl, { headers, timeout: 20000 });
      if (typeof data === 'string' && data.length > 1000 && data.includes('bs')) {
        return cheerio.load(data);
      }
    } catch (e) {
      continue;
    }
  }
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
  const episodeNum = epMatch ? epMatch[1] : '';
  return { title, slug, thumbnail, episode, episodeNum, type, url };
}

async function scrapeHome() {
  console.log('Scraping home page...');
  const $ = await fetchPage(BASE_URL);
  if (!$) return { popular: [], recent: [] };

  const popular = [];
  $('.popularslider .bs').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) popular.push(item);
  });

  const recent = [];
  $('.normal .bs, .postbody .bs').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) recent.push(item);
  });

  console.log(`Home: ${popular.length} popular, ${recent.length} recent`);
  return { popular, recent };
}

async function scrapeSearch(query) {
  const $ = await fetchPage(`${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`);
  if (!$) return [];
  const results = [];
  $('.listupd .bs, .bs').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) results.push(item);
  });
  return results;
}

async function scrapeDetail(slug) {
  let $ = await fetchPage(`${BASE_URL}/${slug}/`);
  if (!$) return null;

  const title = $('h1.entry-title, h1').first().text().trim();
  const pageHtml = $.html();
  const isEpisodePage = pageHtml.includes('player-embed') || (pageHtml.includes('iframe') && slug.includes('episode'));

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
  const epList = seriesSlug !== slug ? $series : $;
  epList('.eplister ul li').each((_, el) => {
    const $li = $(el);
    const a = $li.find('a').first();
    const epNum = $li.find('.epl-num').text().trim();
    const epTitle = $li.find('.epl-title').text().trim();
    const epDate = $li.find('.epl-date').text().trim();
    const epUrl = a.attr('href') || '';
    const numMatch = epNum.match(/(\d+)/);
    episodes.push({
      number: numMatch ? parseInt(numMatch[1]) : 0,
      title: epTitle || `Episode ${epNum}`,
      url: epUrl.replace(BASE_URL, ''),
      date: epDate,
    });
  });

  return {
    title: seriesTitle || title,
    thumbnail,
    synopsis,
    info,
    genres,
    episodes,
    slug: seriesSlug,
    url: `/${seriesSlug}/`,
  };
}

async function scrapeRecentSearches() {
  const popularSearches = ['one piece', 'dragon ball', 'naruto', 'attack on titan', 'demon slayer'];
  const searchCache = {};
  for (const q of popularSearches) {
    searchCache[q] = await scrapeSearch(q);
    await new Promise(r => setTimeout(r, 1000));
  }
  return searchCache;
}

async function pushToFirebase(path, data) {
  const url = authUrl(path);
  try {
    await axios.put(url, {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (4 * 60 * 60 * 1000),
    });
    console.log(`Pushed to Firebase: ${path}`);
    return true;
  } catch (error) {
    console.error(`Firebase push error [${path}]:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== Z.XTREAM Scraper Job ===');
  console.log('Time:', new Date().toISOString());

  if (!DB_URL || !API_KEY) {
    console.error('Missing FIREBASE_DB_URL or FIREBASE_API_KEY');
    process.exit(1);
  }

  // 1. Scrape home page
  const home = await scrapeHome();
  await pushToFirebase('anime/home', home);

  // 2. Build search index from /anime/ pages (all pages)
  console.log('Building search index...');
  const searchIndex = [];
  for (let page = 1; page <= 100; page++) {
    const url = page === 1 ? `${BASE_URL}/anime/` : `${BASE_URL}/anime/page/${page}/`;
    const $ = await fetchPage(url);
    if (!$) break;
    let count = 0;
    $('article.bs').each((_, el) => {
      const item = extractItem($, el);
      if (item.title && item.slug) { searchIndex.push(item); count++; }
    });
    console.log(`  Page ${page}: ${count} items`);
    if (count === 0) break;
    await new Promise(r => setTimeout(r, 500));
  }
  if (searchIndex.length > 0) {
    await pushToFirebase('search/index', searchIndex);
    console.log(`Search index: ${searchIndex.length} items total`);
  }

  // 3. Scrape details for home page items
  const allSlugs = new Set();
  [...home.popular.slice(0, 10), ...home.recent.slice(0, 10)].forEach(item => allSlugs.add(item.slug));
  for (const slug of allSlugs) {
    try {
      const detail = await scrapeDetail(slug);
      if (detail) {
        await pushToFirebase(`anime/detail/${slug}`, detail);
        console.log(`Detail: ${slug} (${detail.episodes?.length || 0} episodes)`);
      }
      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error(`Error scraping detail ${slug}:`, err.message);
    }
  }

  console.log('=== Scraper Job Complete ===');
}

main().catch(err => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
