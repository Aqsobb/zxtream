'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCog, HiOutlinePlus, HiOutlineTrash, HiOutlineShieldCheck, HiOutlineBan, HiOutlineUserGroup } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import RoleBadge from '@/components/ui/RoleBadge';
import { API_BASE } from '@/lib/config';

interface User {
  uid: string;
  displayName: string;
  photoURL: string;
  role: string;
  isOwner: boolean;
  banned: boolean;
  totalExp: number;
  watchTime: number;
  level: number;
}

interface Code {
  type: string;
  value: any;
  maxUses: number;
  usedBy: Record<string, any>;
  description: string;
  createdAt: number;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [tab, setTab] = useState<'codes' | 'users'>('codes');
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<Record<string, Code>>({});
  const [loading, setLoading] = useState(true);

  // Generate code form
  const [codeType, setCodeType] = useState('vip');
  const [codeValue, setCodeValue] = useState('30');
  const [codeMaxUses, setCodeMaxUses] = useState('1');
  const [codeDesc, setCodeDesc] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
    setIsOwner(user?.role === 'owner' || user?.isOwner === true);
    if (user?.role === 'owner' || user?.isOwner) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, codesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`),
        fetch(`${API_BASE}/api/admin/codes`),
      ]);
      const usersData = await usersRes.json();
      const codesData = await codesRes.json();
      if (usersData.success) setUsers(usersData.data);
      if (codesData.success) setCodes(codesData.data || {});
    } catch (e) {
      console.error('Failed to fetch admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!currentUser) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: codeType,
          value: codeType === 'premium' ? parseInt(codeValue) : codeType === 'exp' || codeType === 'coins' ? parseInt(codeValue) : codeType,
          maxUses: parseInt(codeMaxUses),
          description: codeDesc,
          requesterUid: currentUser.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCode(data.data.code);
        fetchData();
      }
    } catch (e) {
      console.error('Failed to generate:', e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSetRole = async (uid: string, role: string) => {
    if (!currentUser) return;
    await fetch(`${API_BASE}/api/admin/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role, requesterUid: currentUser.uid }),
    });
    fetchData();
  };

  const handleBan = async (uid: string) => {
    if (!currentUser) return;
    await fetch(`${API_BASE}/api/admin/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, requesterUid: currentUser.uid }),
    });
    fetchData();
  };

  const handleUnban = async (uid: string) => {
    if (!currentUser) return;
    await fetch(`${API_BASE}/api/admin/unban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, requesterUid: currentUser.uid }),
    });
    fetchData();
  };

  const handleDeleteUser = async (uid: string) => {
    if (!currentUser || !confirm('Delete this user permanently?')) return;
    await fetch(`${API_BASE}/api/admin/delete-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, requesterUid: currentUser.uid }),
    });
    fetchData();
  };

  if (!isOwner) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="text-center">
            <HiOutlineShieldCheck className="w-16 h-16 mx-auto text-red-500/50 mb-4" />
            <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
            <p className="text-gray-400 mt-2">Owner access only</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <HiOutlineCog className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <RoleBadge role="owner" size="sm" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('codes')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'codes' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <HiOutlinePlus className="w-4 h-4 inline mr-1" />
            Generate Codes
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'users' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <HiOutlineUserGroup className="w-4 h-4 inline mr-1" />
            Manage Users ({users.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : tab === 'codes' ? (
          <div className="space-y-6">
            {/* Generate form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Generate New Code</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Type</label>
                  <select
                    value={codeType}
                    onChange={(e) => setCodeType(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="owner">Owner</option>
                    <option value="vvip">VVIP</option>
                    <option value="vip">VIP</option>
                    <option value="premium">Premium</option>
                    <option value="exp">EXP</option>
                    <option value="coins">Coins</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    {codeType === 'premium' ? 'Days' : codeType === 'exp' || codeType === 'coins' ? 'Amount' : 'Role'}
                  </label>
                  <input
                    type={codeType === 'premium' || codeType === 'exp' || codeType === 'coins' ? 'number' : 'text'}
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                    disabled={codeType !== 'premium' && codeType !== 'exp' && codeType !== 'coins'}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Max Uses</label>
                  <input
                    type="number"
                    value={codeMaxUses}
                    onChange={(e) => setCodeMaxUses(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Description</label>
                  <input
                    type="text"
                    value={codeDesc}
                    onChange={(e) => setCodeDesc(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerateCode}
                disabled={generating}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all"
              >
                {generating ? 'Generating...' : 'Generate Code'}
              </button>

              {newCode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl"
                >
                  <p className="text-sm text-green-400">New code generated:</p>
                  <p className="text-xl font-mono font-bold text-white tracking-widest mt-1">{newCode}</p>
                </motion.div>
              )}
            </div>

            {/* Existing codes */}
            <div>
              <h2 className="text-lg font-bold mb-3">Existing Codes</h2>
              <div className="space-y-2">
                {Object.entries(codes).map(([code, data]) => {
                  const uses = data.usedBy ? Object.keys(data.usedBy).length : 0;
                  return (
                    <div key={code} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="font-mono text-sm text-white tracking-wider">{code}</span>
                      <RoleBadge role={data.type} size="sm" showLabel={data.type !== 'exp' && data.type !== 'coins'} />
                      <span className="text-xs text-gray-500">{uses}/{data.maxUses} used</span>
                      {data.description && <span className="text-xs text-gray-400 ml-auto">{data.description}</span>}
                    </div>
                  );
                })}
                {Object.keys(codes).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No codes generated yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Users tab */
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.uid} className={`flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl ${user.banned ? 'opacity-50' : ''}`}>
                <img
                  src={user.photoURL || '/images/default-avatar.png'}
                  alt=""
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{user.displayName}</span>
                    <RoleBadge role={user.role} size="sm" showLabel={false} />
                    {user.banned && <span className="text-xs text-red-400">BANNED</span>}
                  </div>
                  <p className="text-xs text-gray-500">{user.uid} | Lvl {user.level} | {user.totalExp} EXP</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <select
                    value={user.role}
                    onChange={(e) => handleSetRole(user.uid, e.target.value)}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="vvip">VVIP</option>
                  </select>
                  {user.banned ? (
                    <button onClick={() => handleUnban(user.uid)} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">Unban</button>
                  ) : (
                    <button onClick={() => handleBan(user.uid)} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs">Ban</button>
                  )}
                  {!user.isOwner && (
                    <button onClick={() => handleDeleteUser(user.uid)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs">
                      <HiOutlineTrash className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
