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
  return API_KEY ? `${DB_URL}/${path}.json?auth=${API_KEY}` : `${DB_URL}/${path}.json`;
}

async function firebaseGet(path) {
  try {
    const { data } = await axios.get(authUrl(path), { timeout: 10000 });
    return data;
  } catch { return null; }
}

async function firebasePut(path, data) {
  try {
    await axios.put(authUrl(path), data, { timeout: 10000 });
    return true;
  } catch { return false; }
}

async function firebasePost(path, data) {
  try {
    const { data: result } = await axios.post(authUrl(path), data, { timeout: 10000 });
    return result?.name;
  } catch { return null; }
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
    } catch { continue; }
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
  const episodeNum = epMatch ? epMatch[1] : '';
  return { title, slug, thumbnail, episode, episodeNum, type, url };
}

async function scrapeHome() {
  const result = { popular: [], ongoing: [], completed: [] };

  // Popular
  const $pop = await fetchPage(`${BASE_URL}/popular/`);
  if ($pop) {
    $pop('article.bs, .bsx').each((_, el) => {
      const item = extractItem($pop, el);
      if (item.title) result.popular.push(item);
    });
  }
  result.popular = result.popular.slice(0, 12);
  console.log(`Home popular: ${result.popular.length} items`);

  // Ongoing
  const $ong = await fetchPage(`${BASE_URL}/ongoing/`);
  if ($ong) {
    $ong('article.bs, .bsx').each((_, el) => {
      const item = extractItem($ong, el);
      if (item.title) result.ongoing.push(item);
    });
  }
  result.ongoing = result.ongoing.slice(0, 30);
  console.log(`Home ongoing: ${result.ongoing.length} items`);

  return result;
}

async function scrapeDetail(slug) {
  const url = `${BASE_URL}/${slug}`;
  const $ = await fetchPage(url);
  if (!$) return null;

  const info = $('.bigcontent, .anime-info, .infok');
  const title = info.find('h1, .entry-title').first().text().trim() || $('h1.entry-title').first().text().trim();
  const thumbnail = info.find('img').first().attr('src') || '';
  const synopsis = info.find('.synp, .entry-content').first().text().trim() || '';

  const genres = [];
  info.find('.genx a, .genre-info a').each((_, el) => {
    genres.push($(el).text().trim());
  });

  const episodes = [];
  $('.eplister li, .episodelist li').each((_, el) => {
    const a = $(el).find('a');
    const epTitle = a.text().trim();
    const epUrl = a.attr('href') || '';
    const epSlug = epUrl.replace(/^\//, '').replace(/\/$/, '');
    if (epTitle) episodes.push({ title: epTitle, slug: epSlug, url: epUrl });
  });

  return { slug, title, thumbnail, synopsis, genres, episodes, url };
}

// Custom notification messages per anime pattern
const CUSTOM_MESSAGES = {
  'default': [
    '{title} Episode {ep} baru aja drop! 🔥',
    'Update terbaru: {title} Ep {ep} udah bisa ditonton! 🎬',
    '{title} Ep {ep} rilis nih! Siap-siap nonton! ⚡',
    'Breaking: {title} Episode {ep} baru update! 🍿',
    '{title} Ep {ep} udah masuk server! Gas nonton! 🚀',
  ],
  'action': [
    '{title} Episode {ep} udah ready! Action-packed! ⚔️',
    'Battle time! {title} Ep {ep} baru drop! 🗡️',
  ],
  'romance': [
    '{title} Episode {ep} rilis! Siap-siap baper! 💕',
    'Update romantis: {title} Ep {ep} udah tayang! 💖',
  ],
  'comedy': [
    '{title} Episode {ep} baru! Siap-siap ngakak! 😂',
    'Kocak abis! {title} Ep {ep} udah update! 🤣',
  ],
  'fantasy': [
    '{title} Episode {ep} udah masuk! Dunia fantasi menanti! 🌟',
    'Adventure awaits! {title} Ep {ep} baru rilis! ✨',
  ],
  'cultivation': [
    '{title} Episode {ep} update! Saatnya kultivasi! 🧘',
    'Cultivation arc! {title} Ep {ep} udah tayang! ⛰️',
  ],
};

function getCustomMessage(title, episodeNum, genres = []) {
  const msgs = CUSTOM_MESSAGES['default'];

  // Try to find matching genre message
  for (const genre of genres) {
    const lower = genre.toLowerCase();
    if (CUSTOM_MESSAGES[lower]) {
      const genreMsgs = [...CUSTOM_MESSAGES[lower], ...msgs];
      const msg = genreMsgs[Math.floor(Math.random() * genreMsgs.length)];
      return msg.replace('{title}', title).replace('{ep}', episodeNum);
    }
  }

  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  return msg.replace('{title}', title).replace('{ep}', episodeNum);
}

async function detectNewEpisodes() {
  console.log('Detecting new episodes...');

  // Get last known episodes from Firebase
  const lastKnown = await firebaseGet('anime/lastEpisodes') || {};
  const newEpisodes = [];

  // Use homepage latest updates - has episode numbers
  const $ = await fetchPage(`${BASE_URL}/`);
  if (!$) return [];

  const currentItems = [];
  $('article.bs, .bsx').each((_, el) => {
    const item = extractItem($, el);
    if (item.title && item.slug && item.episodeNum) {
      // Extract anime slug from episode slug (remove -episode-xxx-subtitle-indonesia)
      const animeSlug = item.slug
        .replace(/-episode-\d+.*$/, '')
        .replace(/-subtitle-indonesia.*$/, '')
        .replace(/-\d+$/, '');
      currentItems.push({ ...item, animeSlug });
    }
  });

  console.log(`Found ${currentItems.length} items with episode numbers`);

  // Group by anime slug, keep latest episode per anime
  const latestPerAnime = {};
  for (const item of currentItems) {
    const key = item.animeSlug;
    if (!latestPerAnime[key] || parseInt(item.episodeNum) > parseInt(latestPerAnime[key].episodeNum)) {
      latestPerAnime[key] = item;
    }
  }

  console.log(`Tracked ${Object.keys(latestPerAnime).length} unique anime`);

  for (const [animeSlug, item] of Object.entries(latestPerAnime)) {
    const lastEp = lastKnown[animeSlug]?.episodeNum || '0';
    const currentEp = item.episodeNum;

    // New episode detected!
    if (parseInt(currentEp) > parseInt(lastEp)) {
      const detail = await firebaseGet(`anime/detail/${animeSlug}`);
      const genres = detail?.data?.genres || [];

      newEpisodes.push({
        slug: animeSlug,
        title: item.title.replace(/ Episode \d+.*$/i, '').replace(/ Subtitle Indonesia$/i, ''),
        thumbnail: item.thumbnail,
        episode: item.episode,
        episodeNum: currentEp,
        previousEp: lastEp,
        message: getCustomMessage(item.title, currentEp, genres),
        timestamp: Date.now(),
      });
    }

    // Update last known
    lastKnown[animeSlug] = {
      title: item.title.replace(/ Episode \d+.*$/i, '').replace(/ Subtitle Indonesia$/i, ''),
      episodeNum: currentEp,
      thumbnail: item.thumbnail,
      lastSeen: Date.now(),
    };
  }

  // Save updated last known episodes
  await firebasePut('anime/lastEpisodes', lastKnown);

  console.log(`Detected ${newEpisodes.length} new episodes`);
  return newEpisodes;
}

async function sendNotifications(newEpisodes) {
  if (newEpisodes.length === 0) return;

  console.log(`Sending ${newEpisodes.length} notifications...`);

  for (const ep of newEpisodes) {
    // Save to Firebase notifications
    await firebasePost('notifications', {
      title: `📺 ${ep.title} - ${ep.episode}`,
      message: ep.message,
      type: 'episode_update',
      animeSlug: ep.slug,
      episodeNum: ep.episodeNum,
      thumbnail: ep.thumbnail,
      read: false,
      createdAt: Date.now(),
    });

    // Send push notification to all subscribers
    await sendPushNotification(ep);

    console.log(`Notification sent: ${ep.title} - ${ep.episode}`);
  }
}

async function sendPushNotification(episode) {
  // Get all push subscriptions
  const subscriptions = await firebaseGet('pushSubscriptions');
  if (!subscriptions) return;

  const notificationPayload = {
    title: `📺 ${episode.title} Episode ${episode.episodeNum} Baru!`,
    body: episode.message,
    icon: episode.thumbnail || '/images/logo.png',
    badge: '/images/logo.png',
    image: episode.thumbnail,
    data: {
      url: `/watch/${episode.slug}-episode-${episode.episodeNum}-subtitle-indonesia`,
      animeSlug: episode.slug,
      episodeNum: episode.episodeNum,
    },
    tag: `episode-${episode.slug}-${episode.episodeNum}`,
    renotify: true,
  };

  // Send to each subscriber via FCM
  for (const [userId, sub] of Object.entries(subscriptions)) {
    if (!sub?.endpoint) continue;
    try {
      // Store notification for user
      await firebasePost(`userNotifications/${userId}`, {
        ...notificationPayload,
        read: false,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error(`Push error for ${userId}:`, err.message);
    }
  }
}

async function pushToFirebase(path, data) {
  const url = authUrl(path);
  try {
    await axios.put(url, {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (4 * 60 * 60 * 1000),
    });
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

  // 1. Detect new episodes and send notifications
  const newEpisodes = await detectNewEpisodes();
  await sendNotifications(newEpisodes);

  // 2. Scrape home page
  const home = await scrapeHome();
  await pushToFirebase('anime/home', home);

  // 3. Build search index (only first 20 pages for speed)
  console.log('Building search index...');
  const searchIndex = [];
  for (let page = 1; page <= 20; page++) {
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

  // 4. Scrape details for ongoing items
  const allSlugs = new Set();
  [...home.popular.slice(0, 10), ...home.ongoing.slice(0, 15)].forEach(item => allSlugs.add(item.slug));
  for (const slug of allSlugs) {
    try {
      const detail = await scrapeDetail(slug);
      if (detail) {
        await pushToFirebase(`anime/detail/${slug}`, detail);
      }
      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error(`Error scraping detail ${slug}:`, err.message);
    }
  }

  // 5. Save new episodes as latest updates
  if (newEpisodes.length > 0) {
    await pushToFirebase('anime/latestUpdates', newEpisodes);
  }

  console.log('=== Scraper Job Complete ===');
}

// Export functions for API use
module.exports = { detectNewEpisodes, sendNotifications, getCustomMessage, CUSTOM_MESSAGES };

// Run directly
if (require.main === module) {
  main().catch(err => {
    console.error('Scraper failed:', err);
    process.exit(1);
  });
}
