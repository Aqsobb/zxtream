const axios = require('axios');

const BASE_URL = 'https://api.sansekai.my.id/api';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

let rateLimitQueue = [];
let lastRequest = 0;

async function rateLimitedFetch(url, retries = 3) {
  const now = Date.now();
  const waitTime = Math.max(0, 6000 - (now - lastRequest)); // 10 req/min = 6s between
  if (waitTime > 0) {
    await new Promise(r => setTimeout(r, waitTime));
  }
  lastRequest = Date.now();

  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': UA },
        timeout: 15000,
      });
      return data;
    } catch (e) {
      if (e.response?.status === 429) {
        // Rate limited — wait longer
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

function transformDrama(item, source) {
  return {
    title: item.bookName || item.title || '',
    slug: `drama-${item.bookId}`,
    thumbnail: item.coverWap || item.cover || item.thumbnail || '',
    episode: item.chapterCount ? `Ep ${item.chapterCount}` : '',
    episodeNum: item.chapterCount?.toString() || '',
    synopsis: item.introduction || item.synopsis || '',
    type: 'drama',
    source: source || 'dramabox',
    bookId: item.bookId,
    genres: (item.tags || []).join(', '),
    rating: item.score || '',
    playCount: item.playCount || '',
    protagonist: item.protagonist || '',
  };
}


function transformMovie(item) {
  return {
    title: item.title || item.movieName || '',
    slug: `movie-${item.id || item.slug || ''}`,
    thumbnail: item.cover || item.thumbnail || item.poster || '',
    episode: '',
    episodeNum: '',
    synopsis: item.synopsis || item.description || item.introduction || '',
    type: 'movie',
    source: 'moviebox',
    genres: (item.genres || item.tags || []).join(', '),
    rating: item.rating || item.score || '',
    playCount: item.playCount || '',
  };
}

// === DramaBox ===
async function getDramaHome() {
  const [foryou, trending] = await Promise.all([
    rateLimitedFetch(`${BASE_URL}/dramabox/foryou`),
    rateLimitedFetch(`${BASE_URL}/dramabox/trending`),
  ]);
  const items = [...(foryou || []), ...(trending || [])];
  const seen = new Set();
  return (items || []).filter(i => {
    if (seen.has(i.bookId)) return false;
    seen.add(i.bookId);
    return true;
  }).map(i => transformDrama(i, 'dramabox'));
}

async function getDramaTrending() {
  const data = await rateLimitedFetch(`${BASE_URL}/dramabox/trending`);
  return (data || []).map(i => transformDrama(i, 'dramabox'));
}

async function getDramaDetail(bookId) {
  const data = await rateLimitedFetch(`${BASE_URL}/dramabox/detail?bookId=${bookId}`);
  if (!data) return null;

  // Try to get episodes
  let episodes = [];
  const epsData = await rateLimitedFetch(`${BASE_URL}/dramabox/allepisode?bookId=${bookId}`);
  if (epsData && Array.isArray(epsData)) {
    episodes = epsData.map((ep, i) => ({
      title: ep.title || ep.episodeName || `Episode ${i + 1}`,
      number: i + 1,
      url: ep.streamUrl || ep.videoUrl || ep.url || ep.playUrl || '',
      date: ep.date || '',
      duration: ep.duration || '',
    }));
  }

  return {
    title: data.bookName || data.title || '',
    slug: `drama-${bookId}`,
    thumbnail: data.coverWap || data.cover || '',
    synopsis: data.introduction || data.synopsis || '',
    genres: (data.tags || []).join(', '),
    episodes,
    type: 'drama',
    source: 'dramabox',
    bookId,
    rating: data.score || '',
    playCount: data.playCount || '',
    protagonist: data.protagonist || '',
    info: {
      totalepisode: (data.chapterCount || episodes.length).toString(),
      genre: (data.tags || []).join(', '),
    },
  };
}

async function getDramaEpisodes(bookId) {
  const data = await rateLimitedFetch(`${BASE_URL}/dramabox/allepisode?bookId=${bookId}`);
  if (!data || !Array.isArray(data)) return [];

  return data.map((ep, i) => {
    const streamUrl = ep.streamUrl || ep.videoUrl || ep.url || ep.playUrl || '';
    return {
      title: ep.title || ep.episodeName || `Episode ${i + 1}`,
      number: i + 1,
      url: streamUrl,
      date: ep.date || '',
      duration: ep.duration || '',
      servers: streamUrl ? [{
        name: 'Sansekai Stream',
        url: streamUrl,
        directUrl: streamUrl,
        directType: streamUrl.includes('.m3u8') ? 'hls' : 'mp4',
        premium: false,
      }] : [],
    };
  });
}

async function searchDrama(query) {
  const data = await rateLimitedFetch(`${BASE_URL}/dramabox/search?query=${encodeURIComponent(query)}`);
  return (data || []).map(i => transformDrama(i, 'dramabox'));
}

// === Movie (MovieBox) ===
async function getMovieHome() {
  const data = await rateLimitedFetch(`${BASE_URL}/moviebox/home`);
  if (!data) return [];
  if (Array.isArray(data)) return data.map(i => transformMovie(i));
  const items = [];
  if (data.popular) items.push(...data.popular.map(i => transformMovie(i)));
  if (data.latest) items.push(...data.latest.map(i => transformMovie(i)));
  if (data.trending) items.push(...data.trending.map(i => transformMovie(i)));
  return items;
}

async function searchMovie(query) {
  const data = await rateLimitedFetch(`${BASE_URL}/moviebox/search?query=${encodeURIComponent(query)}`);
  return (data || []).map(i => transformMovie(i));
}

module.exports = {
  name: 'sansekai',
  getDramaHome,
  getDramaTrending,
  getDramaDetail,
  getDramaEpisodes,
  searchDrama,
  getMovieHome,
  searchMovie,
};
