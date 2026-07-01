const anichin = require('./sources/anichin');
const sansekai = require('./sources/sansekai');
const reelshort = require('./sources/reelshort');
const storage = require('./storage');

// In-memory request dedup: key => promise
const inFlight = new Map();

function dedupeRun(key, fn) {
  if (inFlight.has(key)) return inFlight.get(key);
  const p = fn().finally(() => { if (inFlight.get(key) === p) inFlight.delete(key); });
  inFlight.set(key, p);
  return p;
}

function dedupeResults(results, key = 'title') {
  const seen = new Set();
  return results.filter(item => {
    const val = (item[key] || '').toLowerCase().trim();
    if (!val || seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

// === Multi-source helpers ===
async function trySources(fnName, ...args) {
  if (anichin[fnName]) {
    try {
      const result = await anichin[fnName](...args);
      if (result && !(Array.isArray(result) && result.length === 0)) return result;
    } catch (e) {
      console.error(`[scraper] anichin.${fnName} failed:`, e.message);
    }
  }
  if (sansekai[fnName]) {
    try {
      return await sansekai[fnName](...args);
    } catch (e) {
      console.error(`[scraper] sansekai.${fnName} failed:`, e.message);
    }
  }
  return null;
}

// === Home ===
async function getHomeAnime() {
  const stored = await storage.getHomePage();
  const isFresh = stored && stored.popular?.length > 0 && (Date.now() - (stored._savedAt || 0)) < 15 * 60 * 1000;

  if (isFresh) return stored;

  // Stale-while-revalidate: return stored immediately, revalidate in background
  if (stored && stored.popular?.length > 0) {
    dedupeRun('home-refresh', async () => {
      try {
        const fresh = await anichin.getHome();
        if (fresh && fresh.popular?.length > 0) {
          storage.saveHomePage(fresh).catch(() => {});
        }
      } catch {}
    });
    return stored;
  }

  // No stored data — scrape (with dedup)
  return dedupeRun('home-scrape', async () => {
    try {
      const fresh = await anichin.getHome();
      if (fresh && fresh.popular?.length > 0) {
        storage.saveHomePage(fresh).catch(() => {});
        return fresh;
      }
    } catch {}

    if (stored && stored.popular?.length > 0) return stored;

    // Last resort: reelshort drama
    try {
      const drama = await reelshort.getHome();
      if (drama?.length > 0) {
        return { popular: drama.slice(0, 20), ongoing: [], schedule: [], hero: drama.slice(0, 5).map(d => ({ title: d.title, slug: d.slug, thumbnail: d.thumbnail, synopsis: d.synopsis })), source: 'reelshort' };
      }
    } catch {}

    return { popular: [], ongoing: [], schedule: [], hero: [] };
  });
}

async function getDramaHomeData() {
  // ReelShort first
  try {
    const dramas = await reelshort.getHome();
    if (dramas?.length > 0) return dramas;
  } catch {}
  // Fallback to sansekai
  try {
    const dramas = await sansekai.getDramaHome();
    if (dramas?.length > 0) return dramas;
  } catch {}
  return [];
}

async function getDramaTrending() {
  try {
    return await sansekai.getDramaTrending() || [];
  } catch { return []; }
}

async function getMovieHomeData() {
  try {
    const movies = await sansekai.getMovieHome();
    if (movies?.length > 0) return movies;
  } catch {}
  return [];
}

// === Anime Detail ===
async function getAnimeDetail(slug, forceRefresh = false) {
  const stored = await storage.getAnime(slug);
  const isFresh = stored?.title && !forceRefresh && (Date.now() - (stored._savedAt || 0)) < 5 * 60 * 1000;

  if (isFresh) return stored;

  if (stored?.title && !forceRefresh) {
    // Stale-while-revalidate
    dedupeRun(`detail-${slug}`, async () => {
      try {
        const fresh = await anichin.getAnimeDetail(slug);
        if (fresh?.title) storage.saveAnime(slug, fresh).catch(() => {});
      } catch {}
    });
    return stored;
  }

  return dedupeRun(`detail-${slug}`, async () => {
    try {
      const fresh = await anichin.getAnimeDetail(slug);
      if (fresh?.title) {
        storage.saveAnime(slug, fresh).catch(() => {});
        return fresh;
      }
    } catch {}
    if (stored?.title) return stored;
    return null;
  });
}

// === Episode Stream ===
async function getEpisodeStream(episodeUrl) {
  try {
    return await anichin.getEpisodeStream(episodeUrl);
  } catch { return null; }
}

// === Search ===
async function searchAnime(query) {
  // Try anichin first
  try {
    const results = await anichin.searchAnime(query);
    if (results?.length > 0) return dedupeResults(results);
  } catch {}

  // Fallback reelshort drama
  try {
    const dramas = await reelshort.searchDrama(query);
    if (dramas?.length > 0) return dedupeResults(dramas.map(r => ({ ...r, type: 'drama', source: 'reelshort' })));
  } catch {}

  // Fallback sansekai drama
  try {
    const dramas = await sansekai.searchDrama(query);
    if (dramas?.length > 0) return dedupeResults(dramas);
  } catch {}

  return [];
}

async function suggestAnime(query) {
  try {
    return await anichin.suggestAnime(query);
  } catch { return []; }
}

// === Ongoing / Completed ===
async function getOngoingAnime(page = 1) {
  try {
    return await anichin.getOngoingAnime(page) || [];
  } catch { return []; }
}

async function getCompletedAnime(page = 1) {
  try {
    return await anichin.getCompletedAnime(page) || [];
  } catch { return []; }
}

async function getAnimeByGenre(genre, page = 1) {
  try {
    return await anichin.getAnimeByGenre(genre, page) || [];
  } catch { return []; }
}

// === Drama API (direct) — Firebase first, scrape only if stale ===
async function getDramaDetail(bookId) {
  const stored = await storage.getDrama(bookId);
  const isFresh = stored?.title && (Date.now() - (stored._savedAt || 0)) < 30 * 60 * 1000;

  if (isFresh) return stored;

  if (stored?.title) {
    dedupeRun(`drama-${bookId}`, async () => {
      try {
        // Try reelshort first
        const fresh = await reelshort.getDramaDetail(bookId);
        if (fresh?.title) { storage.saveDrama(bookId, fresh).catch(() => {}); return; }
      } catch {}
      try {
        // Fallback sansekai
        const fresh = await sansekai.getDramaDetail(bookId);
        if (fresh?.title) storage.saveDrama(bookId, fresh).catch(() => {});
      } catch {}
    });
    return stored;
  }

  return dedupeRun(`drama-${bookId}`, async () => {
    // Try reelshort first
    try {
      const fresh = await reelshort.getDramaDetail(bookId);
      if (fresh?.title) {
        storage.saveDrama(bookId, fresh).catch(() => {});
        return fresh;
      }
    } catch {}
    // Fallback sansekai
    try {
      const fresh = await sansekai.getDramaDetail(bookId);
      if (fresh?.title) {
        storage.saveDrama(bookId, fresh).catch(() => {});
        return fresh;
      }
    } catch {}
    if (stored?.title) return stored;
    return null;
  });
}

async function getDramaEpisodes(bookId) {
  const stored = await storage.getDramaEpisodes(bookId);
  if (stored?.length > 0) return stored;

  // ReelShort first
  try {
    const fresh = await reelshort.getDramaEpisodes(bookId);
    if (fresh?.length > 0) {
      storage.saveDramaEpisodes(bookId, fresh).catch(() => {});
      return fresh;
    }
  } catch {}
  // Fallback sansekai
  try {
    const fresh = await sansekai.getDramaEpisodes(bookId);
    if (fresh?.length > 0) {
      storage.saveDramaEpisodes(bookId, fresh).catch(() => {});
      return fresh;
    }
  } catch {}

  return stored;
}

async function searchDrama(query) {
  // ReelShort first
  try {
    const results = await reelshort.searchDrama(query);
    if (results?.length > 0) return dedupeResults(results.map(r => ({ ...r, type: 'drama', source: 'reelshort' })));
  } catch {}
  // Fallback sansekai
  try {
    const results = await sansekai.searchDrama(query);
    if (results?.length > 0) return dedupeResults(results.map(r => ({ ...r, type: 'drama', source: 'sansekai' })));
  } catch {}
  return [];
}

module.exports = {
  getHomeAnime,
  getDramaHomeData,
  getDramaTrending,
  getMovieHomeData,
  getAnimeDetail,
  getEpisodeStream,
  searchAnime,
  searchDrama,
  suggestAnime,
  getOngoingAnime,
  getCompletedAnime,
  getAnimeByGenre,
  getDramaDetail,
  getDramaEpisodes,
};
