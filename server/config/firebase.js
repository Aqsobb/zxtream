const axios = require('axios');

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://dtabase-80c9a-default-rtdb.asia-southeast1.firebasedatabase.app';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';

function authUrl(path) {
  const sep = path.includes('?') ? '&' : '?';
  return API_KEY ? `${DB_URL}/${path}.json?auth=${API_KEY}` : `${DB_URL}/${path}.json`;
}

async function getCachedData(path) {
  try {
    const { data } = await axios.get(authUrl(path));
    return data;
  } catch (error) {
    console.error(`Firebase read error [${path}]:`, error.message);
    return null;
  }
}

async function setCachedData(path, data, ttlMs = 15 * 60 * 1000) {
  try {
    await axios.put(authUrl(path), {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
    return true;
  } catch (error) {
    console.error(`Firebase write error [${path}]:`, error.message);
    return false;
  }
}

async function getFreshOrCached(path, fetchFn, ttlMs = 15 * 60 * 1000) {
  const cached = await getCachedData(path);
  if (cached && cached.data && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const freshData = await fetchFn();
  if (freshData) {
    await setCachedData(path, freshData, ttlMs);
  }
  return freshData;
}

module.exports = { getCachedData, setCachedData, getFreshOrCached };
