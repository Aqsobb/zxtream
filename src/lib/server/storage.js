const axios = require('axios');

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://dtabase-80c9a-default-rtdb.asia-southeast1.firebasedatabase.app';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';

function authUrl(path) {
  const sep = path.includes('?') ? '&' : '?';
  return API_KEY ? `${DB_URL}/${path}.json?auth=${API_KEY}` : `${DB_URL}/${path}.json`;
}

// === Anime/Donghua Storage ===
async function saveAnime(slug, data) {
  if (!slug || !data?.title) return false;
  try {
    await axios.put(authUrl(`content/anime/${slug}`), {
      ...data,
      _savedAt: Date.now(),
    });
    return true;
  } catch (e) {
    console.error(`[storage] Failed to save anime ${slug}:`, e.message);
    return false;
  }
}

async function getAnime(slug) {
  try {
    const { data } = await axios.get(authUrl(`content/anime/${slug}`));
    return data;
  } catch { return null; }
}

async function saveEpisode(slug, episodeId, data) {
  if (!episodeId) return false;
  try {
    await axios.put(authUrl(`content/episodes/${slug}/${episodeId}`), {
      ...data,
      _savedAt: Date.now(),
    });
    return true;
  } catch { return false; }
}

async function getEpisode(slug, episodeId) {
  try {
    const { data } = await axios.get(authUrl(`content/episodes/${slug}/${episodeId}`));
    return data;
  } catch { return null; }
}

async function saveHomePage(data) {
  if (!data?.popular?.length) return false;
  try {
    await axios.put(authUrl('content/home'), {
      ...data,
      _savedAt: Date.now(),
    });
    return true;
  } catch { return false; }
}

async function getHomePage() {
  try {
    const { data } = await axios.get(authUrl('content/home'));
    return data;
  } catch { return null; }
}

// === Drama Storage (Sansekai) ===
async function saveDrama(bookId, data) {
  if (!bookId || !data?.title) return false;
  try {
    await axios.put(authUrl(`content/drama/${bookId}`), {
      ...data,
      _savedAt: Date.now(),
    });
    return true;
  } catch { return false; }
}

async function getDrama(bookId) {
  try {
    const { data } = await axios.get(authUrl(`content/drama/${bookId}`));
    return data;
  } catch { return null; }
}

async function saveDramaEpisodes(bookId, episodes) {
  if (!bookId || !episodes?.length) return false;
  try {
    await axios.put(authUrl(`content/drama-episodes/${bookId}`), {
      episodes,
      _savedAt: Date.now(),
    });
    return true;
  } catch { return false; }
}

async function getDramaEpisodes(bookId) {
  try {
    const { data } = await axios.get(authUrl(`content/drama-episodes/${bookId}`));
    return data?.episodes || [];
  } catch { return []; }
}

// === Generic fetch with fallback ===
async function getOrFetch(location, fetchFn, ttl = 6 * 60 * 60 * 1000) {
  const stored = await (async () => {
    try {
      const { data } = await axios.get(authUrl(`content/${location}`));
      return data;
    } catch { return null; }
  })();

  if (stored) {
    const age = Date.now() - (stored._savedAt || 0);
    if (age < ttl && stored.title) return stored; // Still fresh
  }

  try {
    const fresh = await fetchFn();
    if (fresh && (fresh.title || fresh.popular?.length > 0)) {
      await axios.put(authUrl(`content/${location}`), {
        ...fresh,
        _savedAt: Date.now(),
      });
    }
    return fresh || stored;
  } catch {
    return stored;
  }
}

module.exports = {
  saveAnime, getAnime,
  saveEpisode, getEpisode,
  saveHomePage, getHomePage,
  saveDrama, getDrama,
  saveDramaEpisodes, getDramaEpisodes,
  getOrFetch,
};
