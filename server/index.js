const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const l = line.trim();
    if (!l || l.startsWith('#')) return;
    const eq = l.indexOf('=');
    if (eq > 0) {
      const key = l.slice(0, eq).trim();
      const val = l.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const scraper = require('./services/scraper');
const userDb = require('./services/user-db');
const adminDb = require('./services/admin-db');

const PORT = process.env.PORT || 3002;
const HOST = '0.0.0.0';
const ROOT = path.join(__dirname, '..');
const NEXT_DIR = path.join(ROOT, '.next');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BUILD_ID = fs.existsSync(path.join(NEXT_DIR, 'BUILD_ID'))
  ? fs.readFileSync(path.join(NEXT_DIR, 'BUILD_ID'), 'utf8').trim()
  : 'dev';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

const DEV_UID = process.env.DEV_UID || '33333';

async function isOwner(uid) {
  if (uid === DEV_UID) return true;
  try {
    const user = await userDb.getUser(uid);
    return user && (user.isOwner || user.role === 'owner');
  } catch { return false; }
}

function sendJSON(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

async function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function getQuery(req) {
  return new URL(req.url, 'http://localhost').searchParams;
}

function send404(res) {
  const notFoundPath = path.join(NEXT_DIR, 'server/app/_not-found.html');
  if (fs.existsSync(notFoundPath)) {
    const html = fs.readFileSync(notFoundPath, 'utf8');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}

function tryServeHTML(res, urlPath) {
  let cleanPath = urlPath.split('?')[0].split('#')[0];
  if (cleanPath === '/') cleanPath = '/home';

  const htmlFile = path.join(NEXT_DIR, 'server/app', cleanPath + '.html');
  if (fs.existsSync(htmlFile)) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return true;
  }

  const indexFile = path.join(NEXT_DIR, 'server/app', cleanPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    const html = fs.readFileSync(indexFile, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return true;
  }

  return false;
}

function serveStaticFile(res, filePath) {
  if (!fs.existsSync(filePath)) return false;
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mime });
  res.end(content);
  return true;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  try {
    if (urlPath === '/health') {
      sendJSON(res, { ok: true, build: BUILD_ID });
      return;
    }

    if (urlPath.startsWith('/api/')) {
      if (urlPath === '/api/anime/home' || urlPath === '/api/anime/popular') {
        const data = await scraper.getHomeAnime();
        sendJSON(res, { success: true, data: { popular: data.popular, recent: data.recent } });
      } else if (urlPath === '/api/anime/recent') {
        const data = await scraper.getHomeAnime();
        sendJSON(res, { success: true, data: { recent: data.recent } });
      } else if (urlPath === '/api/anime/search') {
        const u = new URL(req.url, 'http://localhost');
        const q = u.searchParams.get('q');
        if (!q) { sendJSON(res, { error: 'query required' }, 400); return; }
        const items = await scraper.searchAnime(q);
        sendJSON(res, { success: true, count: items.length, data: items });
      } else if (urlPath.startsWith('/api/anime/detail/')) {
        const slug = urlPath.split('/api/anime/detail/')[1].replace(/\/$/, '');
        const detail = await scraper.getAnimeDetail(slug);
        if (!detail) { sendJSON(res, { error: 'Anime not found' }, 404); return; }
        sendJSON(res, { success: true, data: detail });
      } else if (urlPath.startsWith('/api/anime/episode/stream')) {
        const u = new URL(req.url, 'http://localhost');
        const url = u.searchParams.get('url');
        if (!url) { sendJSON(res, { error: 'url required' }, 400); return; }
        const episodeUrl = url.includes('http') ? url : `https://anichin.moe/${url}/`;
        const stream = await scraper.getEpisodeStream(episodeUrl);
        if (!stream) { sendJSON(res, { error: 'Episode not found' }, 404); return; }
        sendJSON(res, { success: true, data: stream });
      } else if (urlPath.startsWith('/api/anime/episode/')) {
        const slug = urlPath.split('/api/anime/episode/')[1].replace(/\/$/, '');
        const episodeUrl = `https://anichin.moe/${slug}/`;
        const stream = await scraper.getEpisodeStream(episodeUrl);
        if (!stream) { sendJSON(res, { error: 'Episode not found' }, 404); return; }
        sendJSON(res, { success: true, data: stream });
      } else if (urlPath === '/api/users/history' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.userId) { sendJSON(res, { error: 'userId required' }, 400); return; }
        await userDb.addHistory(body.userId, body);
        sendJSON(res, { success: true });
      } else if (urlPath.match(/^\/api\/users\/profile\//) && req.method === 'GET') {
        const uid = urlPath.split('/api/users/profile/')[1].replace(/\/$/, '');
        const user = await userDb.getUser(uid);
        if (!user) { sendJSON(res, { success: false, error: 'Not found' }, 404); return; }
        const { email, ...publicData } = user;
        sendJSON(res, { success: true, data: publicData });
      } else if (urlPath.match(/^\/api\/users\/profile\//) && (req.method === 'PUT' || req.method === 'PATCH')) {
        const uid = urlPath.split('/api/users/profile/')[1].replace(/\/$/, '');
        const body = await readBody(req);
        await userDb.updateUser(uid, body);
        sendJSON(res, { success: true });
      } else if (urlPath === '/api/users/bookmark' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.userId || !body.animeSlug) { sendJSON(res, { error: 'Missing fields' }, 400); return; }
        const isBookmarked = await userDb.toggleBookmark(body.userId, body.animeSlug);
        sendJSON(res, { success: true, data: { isBookmarked } });
      } else if (urlPath === '/api/users/follow' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.followerId || !body.followingId) { sendJSON(res, { error: 'Missing fields' }, 400); return; }
        const isFollowing = await userDb.toggleFollow(body.followerId, body.followingId);
        if (isFollowing === null) { sendJSON(res, { error: 'User not found' }, 404); return; }
        sendJSON(res, { success: true, data: { isFollowing } });
      } else if (urlPath.match(/^\/api\/users\/leaderboard\//) && req.method === 'GET') {
        const type = urlPath.split('/api/users/leaderboard/')[1].replace(/\/$/, '');
        const q = getQuery(req);
        const data = await userDb.getLeaderboard(type === 'level' || type === 'exp' ? 'totalExp' : type === 'watchtime' ? 'watchTime' : type === 'comments' ? 'commentCount' : 'totalExp', parseInt(q.get('limit') || '100'));
        sendJSON(res, { success: true, data });
      } else if (urlPath === '/api/users/search' && req.method === 'GET') {
        const q = getQuery(req).get('q');
        if (!q) { sendJSON(res, { error: 'Query required' }, 400); return; }
        const users = await userDb.searchUsers(q);
        sendJSON(res, { success: true, data: users });
      } else if (urlPath === '/api/site/settings' && req.method === 'GET') {
        try {
          const dbUrl = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/siteSettings.json?auth=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;
          const { data } = await require('axios').get(dbUrl);
          sendJSON(res, { success: true, data: data || {} });
        } catch {
          sendJSON(res, { success: true, data: {} });
        }
      } else if (urlPath === '/api/site/settings' && req.method === 'POST') {
        const body = await readBody(req);
        if (!(await isOwner(body.requesterUid))) {
          sendJSON(res, { error: 'Not authorized' }, 403); return;
        }
        try {
          const dbUrl = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/siteSettings.json?auth=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;
          await require('axios').put(dbUrl, body.settings);
          sendJSON(res, { success: true });
        } catch (e) {
          sendJSON(res, { error: e.message }, 500);
        }
      } else if (urlPath === '/api/redeem' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.code || !body.uid) { sendJSON(res, { error: 'code and uid required' }, 400); return; }
        const result = await adminDb.redeemCode(body.code.toUpperCase(), body.uid, body.displayName || 'Anonymous');
        sendJSON(res, result, result.success ? 200 : 400);
      } else if (urlPath === '/api/admin/codes' && req.method === 'GET') {
        const codes = await adminDb.getAllCodes();
        sendJSON(res, { success: true, data: codes });
      } else if (urlPath === '/api/admin/codes' && req.method === 'POST') {
        const body = await readBody(req);
        const { type, value, maxUses, description, requesterUid } = body;
        if (!(await isOwner(requesterUid))) {
          sendJSON(res, { error: 'Not authorized' }, 403); return;
        }
        const result = await adminDb.generateCode(type, value, maxUses || 1, description || '');
        sendJSON(res, { success: true, data: result });
      } else if (urlPath === '/api/admin/delete-comment' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.commentId || !body.requesterUid) { sendJSON(res, { error: 'Missing fields' }, 400); return; }
        const result = await adminDb.deleteComment(body.commentId, body.requesterUid);
        sendJSON(res, result, result.success ? 200 : 403);
      } else if (urlPath === '/api/admin/users' && req.method === 'GET') {
        const users = await adminDb.getAllUsers();
        sendJSON(res, { success: true, data: users });
      } else if (urlPath === '/api/admin/role' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.uid || !body.role || !body.requesterUid) { sendJSON(res, { error: 'Missing fields' }, 400); return; }
        if (!(await isOwner(body.requesterUid))) {
          sendJSON(res, { error: 'Not authorized' }, 403); return;
        }
        const result = await adminDb.setRole(body.uid, body.role);
        sendJSON(res, result);
      } else if (urlPath === '/api/admin/ban' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.uid || !body.requesterUid) { sendJSON(res, { error: 'Missing fields' }, 400); return; }
        if (!(await isOwner(body.requesterUid))) {
          sendJSON(res, { error: 'Not authorized' }, 403); return;
        }
        const result = await adminDb.banUser(body.uid);
        sendJSON(res, result);
      } else if (urlPath === '/api/admin/unban' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.uid || !body.requesterUid) { sendJSON(res, { error: 'Missing fields' }, 400); return; }
        if (!(await isOwner(body.requesterUid))) {
          sendJSON(res, { error: 'Not authorized' }, 403); return;
        }
        const result = await adminDb.unbanUser(body.uid);
        sendJSON(res, result);
      } else if (urlPath === '/api/admin/delete-user' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.uid || !body.requesterUid) { sendJSON(res, { error: 'Missing fields' }, 400); return; }
        if (!(await isOwner(body.requesterUid))) {
          sendJSON(res, { error: 'Not authorized' }, 403); return;
        }
        const result = await adminDb.deleteUser(body.uid);
        sendJSON(res, result);
      } else {
        sendJSON(res, { error: 'API route not found' }, 404);
      }
      return;
    }

    if (urlPath.startsWith('/_next/static/')) {
      const staticPath = path.join(NEXT_DIR, urlPath.replace('/_next/', '_next/'));
      if (serveStaticFile(res, staticPath)) return;
    }

    if (urlPath.startsWith('/_next/')) {
      const nextPath = path.join(NEXT_DIR, urlPath.replace('/_next/', '_next/'));
      if (serveStaticFile(res, nextPath)) return;
    }

    const publicPath = path.join(PUBLIC_DIR, urlPath);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      if (serveStaticFile(res, publicPath)) return;
    }

    if (tryServeHTML(res, urlPath)) return;

    if (urlPath.startsWith('/api/') || urlPath.startsWith('/_next/')) return;

    if (tryServeHTML(res, '/home')) return;

    send404(res);
  } catch (error) {
    console.error('Error:', error.message);
    sendJSON(res, { success: false, error: error.message }, 500);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Z.XTREAM running on http://${HOST}:${PORT}`);
  console.log(`Build: ${BUILD_ID}`);
  console.log(`Serving: ${NEXT_DIR}`);
});
