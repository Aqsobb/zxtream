const axios = require('axios');

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

function authUrl(path) {
  return API_KEY
    ? `${DB_URL}/${path}.json?auth=${API_KEY}`
    : `${DB_URL}/${path}.json`;
}

// --- Codes ---
async function getAllCodes() {
  try {
    const { data } = await axios.get(authUrl('codes'));
    return data || {};
  } catch { return {}; }
}

async function generateCode(type, value, maxUses = 1, description = '') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];

  const codeData = {
    type,
    value,
    maxUses,
    usedBy: {},
    description,
    createdAt: Date.now(),
  };

  await axios.put(authUrl(`codes/${code}`), codeData);
  return { code, ...codeData };
}

async function redeemCode(code, uid, displayName) {
  const allCodes = await getAllCodes();
  const codeData = allCodes[code];

  if (!codeData) return { success: false, error: 'Code not found' };
  if (codeData.usedBy && Object.keys(codeData.usedBy).length >= codeData.maxUses) {
    return { success: false, error: 'Code already used' };
  }

  const usedUpdate = {};
  usedUpdate[`codes/${code}/usedBy/${uid}`] = {
    displayName,
    usedAt: Date.now(),
  };
  await axios.patch(authUrl(''), usedUpdate);

  let roleUpdate = {};
  let message = '';

  switch (codeData.type) {
    case 'dev':
      roleUpdate = { role: 'dev', isDev: true, roleAssignedAt: Date.now() };
      message = 'You are now a Developer!';
      break;
    case 'owner':
      roleUpdate = { role: 'owner', isOwner: true, roleAssignedAt: Date.now() };
      message = 'You are now an Owner!';
      break;
    case 'vvip':
      roleUpdate = { role: 'vvip', roleAssignedAt: Date.now() };
      message = 'You are now VVIP!';
      break;
    case 'vip':
      roleUpdate = { role: 'vip', roleAssignedAt: Date.now() };
      message = 'You are now VIP!';
      break;
    case 'premium':
      roleUpdate = { role: 'premium', premiumUntil: Date.now() + (codeData.value || 30) * 86400000 };
      message = `Premium activated for ${codeData.value || 30} days!`;
      break;
    case 'exp':
      const expAmount = codeData.value || 1000;
      const currentUser = await getSimpleUser(uid);
      roleUpdate = { totalExp: (currentUser?.totalExp || 0) + expAmount };
      message = `+${expAmount} EXP added!`;
      break;
    case 'coins': {
      const coinsUser = await getSimpleUser(uid);
      roleUpdate = { coins: (coinsUser?.coins || 0) + (codeData.value || 1000) };
      message = `+${codeData.value || 1000} Coins added!`;
      break;
    }
    default:
      return { success: false, error: 'Unknown code type' };
  }

  await axios.patch(authUrl(`users/${uid}`), roleUpdate);
  return { success: true, message, type: codeData.type };
}

// --- Comments admin ---
async function deleteComment(commentId, requesterUid) {
  const requester = await getSimpleUser(requesterUid);
  if (!requester || (!requester.isOwner && requester.role !== 'owner' && requester.role !== 'dev' && !requester.isDev && requester.role !== 'vvip')) {
    return { success: false, error: 'Not authorized' };
  }

  const types = ['anime', 'episode'];
  for (const type of types) {
    try {
      const { data } = await axios.get(authUrl(`comments/${type}`));
      if (!data) continue;
      for (const [targetId, comments] of Object.entries(data)) {
        if (comments[commentId]) {
          await axios.delete(authUrl(`comments/${type}/${targetId}/${commentId}`));
          return { success: true };
        }
      }
    } catch { continue; }
  }
  return { success: false, error: 'Comment not found' };
}

async function getSimpleUser(uid) {
  try {
    const { data } = await axios.get(authUrl(`users/${uid}`));
    return data;
  } catch { return null; }
}

// --- Admin: manage users ---
async function setRole(uid, role) {
  try {
    await axios.patch(authUrl(`users/${uid}`), {
      role,
      isOwner: role === 'owner',
      roleAssignedAt: Date.now(),
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function banUser(uid) {
  try {
    await axios.patch(authUrl(`users/${uid}`), { banned: true });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function unbanUser(uid) {
  try {
    await axios.patch(authUrl(`users/${uid}`), { banned: false });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteUser(uid, requesterUid) {
  try {
    const uidStr = String(uid);
    const reqStr = String(requesterUid);

    // Safety: check requester is owner
    if (reqStr) {
      const requester = await getSimpleUser(reqStr);
      if (!requester || (!requester.isOwner && requester.role !== 'owner' && requester.role !== 'dev' && !requester.isDev)) {
        return { success: false, error: 'Only owners/devs can delete users' };
      }
      // Safety: can't delete yourself
      if (reqStr === uidStr) {
        return { success: false, error: 'Cannot delete yourself' };
      }
      // Safety: can't delete other owners
      const target = await getSimpleUser(uidStr);
      if (target && (target.isOwner === true || target.role === 'owner')) {
        return { success: false, error: 'Cannot delete another owner' };
      }
    }

    // Clean up related data in parallel
    const cleanupPromises = [];

    // 1. Delete user's comments
    for (const type of ['anime', 'episode']) {
      cleanupPromises.push(
        axios.get(authUrl(`comments/${type}`)).then(({ data }) => {
          if (!data) return;
          const deletions = [];
          for (const [targetId, comments] of Object.entries(data)) {
            for (const [cid, comment] of Object.entries(comments)) {
              if (comment.uid === uid) {
                deletions.push(axios.delete(authUrl(`comments/${type}/${targetId}/${cid}`)));
              }
            }
          }
          return Promise.all(deletions);
        }).catch(() => {})
      );
    }

    // 2. Delete user's ratings
    cleanupPromises.push(
      axios.get(authUrl('ratings')).then(({ data }) => {
        if (!data) return;
        const deletions = [];
        for (const [targetId, ratings] of Object.entries(data)) {
          if (ratings[uid]) {
            deletions.push(axios.delete(authUrl(`ratings/${targetId}/${uid}`)));
          }
        }
        return Promise.all(deletions);
      }).catch(() => {})
    );

    // 3. Delete user's notifications
    cleanupPromises.push(
      axios.delete(authUrl(`notifications/${uid}`)).catch(() => {})
    );

    // 4. Delete user's progress
    cleanupPromises.push(
      axios.delete(authUrl(`progress/${uid}`)).catch(() => {})
    );

    // Wait for cleanup
    await Promise.all(cleanupPromises);

    // 5. Delete the user node
    await axios.delete(authUrl(`users/${uid}`));

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getAllUsers() {
  try {
    const { data } = await axios.get(authUrl('users'));
    if (!data) return [];
    return Object.entries(data).map(([uid, u]) => ({
      uid,
      displayName: u.displayName,
      photoURL: u.photoURL,
      role: u.role || 'member',
      isOwner: u.isOwner || false,
      banned: u.banned || false,
      totalExp: u.totalExp || 0,
      watchTime: u.watchTime || 0,
      level: u.level || 1,
    }));
  } catch { return []; }
}

module.exports = {
  getAllCodes, generateCode, redeemCode,
  deleteComment, setRole, banUser, unbanUser, deleteUser, getAllUsers,
};
