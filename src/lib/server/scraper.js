const anichin = require('./sources/anichin');
const sansekai = require('./sources/sansekai');
const storage = require('./storage');

// === Multi-source helpers ===
async function trySources(fnName, ...args) {
  // Try anichin first
  if (anichin[fnName]) {
    try {
      const result = await anichin[fnName](...args);
      if (result && !(Array.isArray(result) && result.length === 0)) return result;
    } catch (e) {
      console.error(`[scraper] anichin.${fnName} failed:`, e.message);
    }
  }

  // Fallback to sansekai
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
async function getHomeAnime(forceRefresh = false) {
  // Try fresh from anichin first
  try {
    const fresh = await anichin.getHome();
    if (fresh && fresh.popular?.length > 0) {
      await storage.saveHomePage(fresh).catch(() => {});
      return fresh;
    }
  } catch {}

  // Fallback to stored
  const stored = await storage.getHomePage();
  if (stored && stored.popular?.length > 0) return stored;

  // Last resort: sansekai drama
  try {
    const drama = await sansekai.getDramaHome();
    if (drama?.length > 0) {
      return { popular: drama.slice(0, 20), ongoing: [], schedule: [], hero: drama.slice(0, 5).map(d => ({ title: d.title, slug: d.slug, thumbnail: d.thumbnail, synopsis: d.synopsis })), source: 'sansekai' };
    }
  } catch {}

  return { popular: [], ongoing: [], schedule: [], hero: [] };
}

async function getDramaHomeData() {
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
  // Check permanent storage first (if not force refresh)
  if (!forceRefresh) {
    const stored = await storage.getAnime(slug);
    if (stored && stored.title) {
      const age = Date.now() - (stored._savedAt || 0);
      if (age < 5 * 60 * 1000) return stored; // 5 min cache
    }
  }

  // Try to scrape fresh
  try {
    const fresh = await anichin.getAnimeDetail(slug);
    if (fresh?.title) {
      await storage.saveAnime(slug, fresh).catch(() => {});
      return fresh;
    }
  } catch {}

  // Fallback to stored (even if stale)
  const stored = await storage.getAnime(slug);
  if (stored?.title) return stored;

  return null;
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
    if (results?.length > 0) return results;
  } catch {}

  // Fallback sansekai drama
  try {
    const dramas = await sansekai.searchDrama(query);
    if (dramas?.length > 0) return dramas;
  } catch {}

  // Fallback sansekai anime
  try {
    const anime = await sansekai.searchAnime(query);
    if (anime?.length > 0) return anime;
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

// === Drama API (direct) ===
async function getDramaDetail(bookId) {
  try {
    const fresh = await sansekai.getDramaDetail(bookId);
    if (fresh?.title) {
      await storage.saveDrama(bookId, fresh).catch(() => {});
      return fresh;
    }
  } catch {}

  const stored = await storage.getDrama(bookId);
  if (stored?.title) return stored;
  return null;
}

async function getDramaEpisodes(bookId) {
  try {
    const fresh = await sansekai.getDramaEpisodes(bookId);
    if (fresh?.length > 0) {
      await storage.saveDramaEpisodes(bookId, fresh).catch(() => {});
      return fresh;
    }
  } catch {}

  return await storage.getDramaEpisodes(bookId);
}

module.exports = {
  getHomeAnime,
  getDramaHomeData,
  getDramaTrending,
  getMovieHomeData,
  getAnimeDetail,
  getEpisodeStream,
  searchAnime,
  suggestAnime,
  getOngoingAnime,
  getCompletedAnime,
  getAnimeByGenre,
  getDramaDetail,
  getDramaEpisodes,
};
