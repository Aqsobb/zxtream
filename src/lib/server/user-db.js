const axios = require('axios');

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

function authUrl(path) {
  return API_KEY
    ? `${DB_URL}/${path}.json?auth=${API_KEY}`
    : `${DB_URL}/${path}.json`;
}

async function getUser(uid) {
  try {
    const { data } = await axios.get(authUrl(`users/${uid}`));
    return data;
  } catch {
    return null;
  }
}

async function setUser(uid, data) {
  try {
    await axios.put(authUrl(`users/${uid}`), data);
    return true;
  } catch (e) {
    console.error('setUser error:', e.message);
    return false;
  }
}

async function updateUser(uid, updates) {
  try {
    await axios.patch(authUrl(`users/${uid}`), updates);
    return true;
  } catch (e) {
    console.error('updateUser error:', e.message);
    return false;
  }
}

async function addHistory(uid, entry) {
  try {
    const current = await getUser(uid);
    const history = current?.history || [];
    history.push({ ...entry, timestamp: Date.now() });
    if (history.length > 200) history.splice(0, history.length - 200);
    await updateUser(uid, {
      history,
      watchTime: (current?.watchTime || 0) + (entry.progress || 0),
    });
    return true;
  } catch (e) {
    console.error('addHistory error:', e.message);
    return false;
  }
}

async function toggleBookmark(uid, animeSlug) {
  try {
    const current = await getUser(uid);
    const bookmarks = current?.bookmarks || [];
    const idx = bookmarks.indexOf(animeSlug);
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
    } else {
      bookmarks.push(animeSlug);
    }
    await updateUser(uid, { bookmarks });
    return !bookmarks.includes(animeSlug);
  } catch (e) {
    console.error('toggleBookmark error:', e.message);
    return false;
  }
}

async function toggleFollow(followerId, followingId) {
  try {
    const follower = await getUser(followerId);
    const following = await getUser(followingId);
    if (!follower || !following) return null;

    const isFollowing = follower.following?.includes(followingId);

    if (isFollowing) {
      const f = (follower.following || []).filter(id => id !== followingId);
      const g = (following.followers || []).filter(id => id !== followerId);
      await updateUser(followerId, { following: f });
      await updateUser(followingId, { followers: g });
    } else {
      await updateUser(followerId, {
        following: [...(follower.following || []), followingId],
      });
      await updateUser(followingId, {
        followers: [...(following.followers || []), followerId],
      });
      await axios.post(authUrl('notifications'), {
        userId: followingId,
        type: 'follow',
        title: 'New Follower',
        message: `${follower.displayName || 'Someone'} started following you`,
        fromUser: followerId,
        isRead: false,
        createdAt: Date.now(),
      }).catch(() => {});
    }
    return !isFollowing;
  } catch (e) {
    console.error('toggleFollow error:', e.message);
    return null;
  }
}

async function getLeaderboard(orderBy = 'totalExp', limit = 100) {
  try {
    const { data } = await axios.get(authUrl('users'));
    if (!data) return [];
    const users = Object.entries(data).map(([uid, u]) => ({
      uid,
      displayName: u.displayName,
      photoURL: u.photoURL,
      level: u.level,
      exp: u.totalExp || 0,
      totalExp: u.totalExp || 0,
      title: u.title,
      role: u.role || 'member',
      badges: u.badges || [],
      watchTime: u.watchTime || 0,
      country: u.country,
    }));
    users.sort((a, b) => (b[orderBy] || 0) - (a[orderBy] || 0));
    return users.slice(0, limit);
  } catch (e) {
    console.error('getLeaderboard error:', e.message);
    return [];
  }
}

async function searchUsers(q) {
  try {
    const { data } = await axios.get(authUrl('users'));
    if (!data) return [];
    const lower = q.toLowerCase();
    return Object.entries(data)
      .filter(([_, u]) =>
        (u.displayName || '').toLowerCase().includes(lower)
      )
      .slice(0, 20)
      .map(([uid, u]) => {
        const { email, ...publicData } = u;
        return { uid, ...publicData };
      });
  } catch (e) {
    console.error('searchUsers error:', e.message);
    return [];
  }
}

module.exports = {
  getUser, setUser, updateUser,
  addHistory, toggleBookmark, toggleFollow,
  getLeaderboard, searchUsers,
};
