const axios = require('axios');
const cheerio = require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': UA,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.reelshort.com/',
  'Origin': 'https://www.reelshort.com',
};

let cachedBuildId = null;

async function getBuildId() {
  if (cachedBuildId) return cachedBuildId;
  try {
    const { data } = await axios.get('https://www.reelshort.com/', {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      timeout: 12000,
      maxRedirects: 5,
    });
    const m = data.match(/"buildId"\s*:\s*"(\d+)"/) || data.match(/_next\/data\/(\d+)\//);
    if (m) { cachedBuildId = m[1]; return cachedBuildId; }
  } catch {}
  return '1782267454600';
}

function filterTitle(title) {
  return (title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/ /g, '-');
}

async function apiFetch(path) {
  const buildId = await getBuildId();
  const url = `https://www.reelshort.com/_next/data/${buildId}/id${path}`;
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000, maxRedirects: 5 });
  return data;
}

function transformBook(book) {
  return {
    title: book.book_title || '',
    slug: `reelshort-${book.book_id || book.t_book_id}`,
    thumbnail: book.book_pic || '',
    synopsis: book.special_desc || '',
    type: 'drama',
    source: 'reelshort',
    genres: (book.tag || []).join(', '),
    rating: book.score || '',
    episode: book.chapter_count ? `${book.chapter_count} Ep` : '',
    episodeNum: book.chapter_count?.toString() || '',
    readCount: book.read_count || 0,
    isDub: book.is_dub || 0,
    bookId: book.book_id || '',
    tBookId: book.t_book_id || '',
  };
}

async function getHome() {
  // ReelShort search with empty keyword doesn't return results
  // Use popular search terms to get a good collection
  const queries = ['love', 'revenge', 'ceo', 'reborn', 'sweet'];
  const allBooks = [];
  const seen = new Set();
  for (const q of queries) {
    try {
      const data = await apiFetch(`/search.json?keywords=${encodeURIComponent(q)}`);
      const books = data?.pageProps?.books || [];
      for (const b of books) {
        if (!seen.has(b.book_id)) {
          seen.add(b.book_id);
          allBooks.push(transformBook(b));
        }
      }
      await new Promise(r => setTimeout(r, 1500));
    } catch {}
  }
  return allBooks;
}

async function searchDrama(query) {
  const data = await apiFetch(`/search.json?keywords=${encodeURIComponent(query)}`);
  const books = data?.pageProps?.books || [];
  return books.map(transformBook);
}

async function getDramaDetail(bookId) {
  try {
    // Try to get detail directly using the slug pattern
    // First search to find the book info
    const data = await apiFetch('/search.json?keywords=');
    let book = (data?.pageProps?.books || []).find(b => b.book_id === bookId || b.t_book_id === bookId);

    // If not found in empty search, try broader search
    if (!book) {
      const terms = ['love', 'revenge', 'ceo', 'reborn', 'sweet'];
      for (const term of terms) {
        if (book) break;
        try {
          const d = await apiFetch(`/search.json?keywords=${encodeURIComponent(term)}`);
          book = (d?.pageProps?.books || []).find(b => b.book_id === bookId || b.t_book_id === bookId);
          await new Promise(r => setTimeout(r, 1500));
        } catch {}
      }
    }

    if (!book) return null;

    const slug = filterTitle(book.book_title) + '-' + book.book_id;
    const detail = await apiFetch(`/movie/${slug}.json?slug=${slug}`);
    const d = detail?.pageProps?.data;
    if (!d) return null;

    const chapters = (d.online_base || []).map(ep => ({
      title: `Episode ${ep.serial_number}`,
      number: ep.serial_number,
      chapterId: ep.chapter_id,
      likeCount: ep.like_count || 0,
    }));

    return {
      title: d.book_title || book.book_title,
      slug: `reelshort-${bookId}`,
      thumbnail: d.book_pic || book.book_pic,
      synopsis: d.special_desc || book.special_desc,
      genres: (d.tag || book.tag || []).join(', '),
      episodes: chapters,
      type: 'drama',
      source: 'reelshort',
      bookId,
      tBookId: d.t_book_id || book.t_book_id,
      rating: book.score || '',
      readCount: d.read_count || book.read_count || 0,
      collectCount: d.collect_count || 0,
      chapterCount: d.chapter_count || book.chapter_count || 0,
    };
  } catch {
    return null;
  }
}

async function getDramaEpisodes(bookId) {
  const detail = await getDramaDetail(bookId);
  if (!detail) return [];
  return detail.episodes.map(ep => ({
    title: ep.title,
    number: ep.number,
    url: '',
    date: '',
    duration: '',
    servers: [],
  }));
}

async function getEpisodeStream(bookId, episodeNum, chapterId) {
  try {
    // Search to find the book
    const terms = ['love', 'revenge', 'ceo', 'reborn', 'sweet'];
    let book = null;
    for (const term of terms) {
      try {
        const data = await apiFetch(`/search.json?keywords=${encodeURIComponent(term)}`);
        book = (data?.pageProps?.books || []).find(b => b.book_id === bookId || b.t_book_id === bookId);
        if (book) break;
        await new Promise(r => setTimeout(r, 1500));
      } catch {}
    }
    if (!book) return null;

    const slug = filterTitle(book.book_title) + '-' + book.book_id;
    const detail = await apiFetch(`/movie/${slug}.json?slug=${slug}`);
    const d = detail?.pageProps?.data;
    const chapters = d?.online_base || [];
    const ch = chapterId
      ? chapters.find(c => c.chapter_id === chapterId)
      : chapters.find(c => c.serial_number === episodeNum) || chapters[episodeNum - 1];
    if (!ch) return null;

    const filtered = filterTitle(book.book_title);
    const videoSlug = `episode-${ch.serial_number}-${filtered}-${book.book_id}-${ch.chapter_id}`;

    await new Promise(r => setTimeout(r, 1500));
    const vid = await apiFetch(`/episodes/${videoSlug}.json?play_time=1&slug=${videoSlug}`);
    const vp = vid?.pageProps?.data;
    if (!vp?.video_url) return null;

    return {
      videoUrl: vp.video_url,
      thumbnail: vp.video_pic || book.book_pic,
      title: vp.chapter_desc || `Episode ${ch.serial_number}`,
      duration: vp.duration || '',
      episodeNum: ch.serial_number,
      servers: [{
        name: 'ReelShort HLS',
        url: vp.video_url,
        directUrl: vp.video_url,
        directType: vp.video_url.includes('.m3u8') ? 'hls' : 'mp4',
        premium: false,
      }],
    };
  } catch {
    return null;
  }
}

module.exports = {
  name: 'reelshort',
  getHome,
  searchDrama,
  getDramaDetail,
  getDramaEpisodes,
  getEpisodeStream,
};
