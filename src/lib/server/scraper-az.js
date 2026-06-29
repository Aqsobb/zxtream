const axios = require('axios');
const cheerio = require('cheerio');
const { getCachedData, setCachedData } = require('./firebase');

const BASE_URL = 'https://anichin.moe';

const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
];

function pickUA() { return UA_LIST[Math.floor(Math.random() * UA_LIST.length)]; }

function makeHeaders() {
  return {
    'User-Agent': pickUA(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };
}

function parseHtml(html) {
  if (!html || typeof html !== 'string') return null;
  if (html.includes('challenge-platform') || html.length < 500) return null;
  try { return cheerio.load(html); } catch { return null; }
}

async function fetchPage(url) {
  try {
    const { data } = await axios.get(url, { headers: makeHeaders(), timeout: 12000, maxRedirects: 5 });
    return parseHtml(data);
  } catch { return null; }
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

async function getAZList(letter, page = 1) {
  const cacheKey = `az/${letter}/${page}`;
  const cached = await getCachedData(cacheKey);
  if (cached?.data?.length > 0) return cached.data;

  const url = page === 1
    ? `${BASE_URL}/az-lists/?show=${encodeURIComponent(letter)}`
    : `${BASE_URL}/az-lists/page/${page}/?show=${encodeURIComponent(letter)}`;
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

  const deduped = dedupe(results);
  if (deduped.length > 0) {
    await setCachedData(cacheKey, deduped, 30 * 60 * 1000);
  }
  return deduped;
}

async function getUpcomingAnime() {
  const cacheKey = 'upcoming';
  const cached = await getCachedData(cacheKey);
  if (cached?.data?.length > 0) return cached.data;

  const $ = await fetchPage(`${BASE_URL}/upcoming-donghua/`);
  if (!$) return [];

  const results = [];
  $('article.bs, .bsx').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug) results.push(item);
  });

  const deduped = dedupe(results);
  if (deduped.length > 0) {
    await setCachedData(cacheKey, deduped, 30 * 60 * 1000);
  }
  return deduped;
}

module.exports = { getAZList, getUpcomingAnime };
