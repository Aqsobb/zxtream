'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiOutlineCog, HiOutlinePlus, HiOutlineTrash, HiOutlineShieldCheck,
  HiOutlineBan, HiOutlineUserGroup, HiOutlineColorSwatch, HiOutlineChat,
  HiOutlineBell, HiOutlineChartBar, HiOutlineLink, HiOutlineGlobe,
  HiOutlineCurrencyDollar, HiOutlineExclamation,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import RoleBadge from '@/components/ui/RoleBadge';
import { API_BASE } from '@/lib/config';
import HeroSlidesTab from '@/components/admin/HeroSlidesTab';

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

interface Comment {
  id: string;
  type: string;
  targetId: string;
  uid: string;
  displayName: string;
  photoURL: string;
  text: string;
  createdAt: number;
}

type Tab = 'overview' | 'users' | 'codes' | 'theme' | 'comments' | 'broadcast' | 'donations' | 'notifications' | 'hero';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<Record<string, Code>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  // Code form
  const [codeType, setCodeType] = useState('vip');
  const [codeValue, setCodeValue] = useState('30');
  const [codeMaxUses, setCodeMaxUses] = useState('1');
  const [codeDesc, setCodeDesc] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState('');

  // Theme form
  const [siteName, setSiteName] = useState('Z.XTREAM');
  const [siteDesc, setSiteDesc] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#a78bfa');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [telegramLink, setTelegramLink] = useState('');
  const [savingTheme, setSavingTheme] = useState(false);

  // Donation form
  const [donationEnabled, setDonationEnabled] = useState(false);
  const [donationQR, setDonationQR] = useState('');
  const [donationDana, setDonationDana] = useState('');
  const [donationTelegram, setDonationTelegram] = useState('');
  const [savingDonation, setSavingDonation] = useState(false);

  // Broadcast form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
    setIsOwner(user?.role === 'owner' || user?.isOwner === true);
    if (user?.role === 'owner' || user?.isOwner) {
      fetchAll();
    }
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, codesRes, analyticsRes, commentsRes, themeRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`),
        fetch(`${API_BASE}/api/admin/codes`),
        fetch(`${API_BASE}/api/admin/analytics`),
        fetch(`${API_BASE}/api/admin/comments`),
        fetch(`${API_BASE}/api/admin/theme`),
      ]);
      const usersData = await usersRes.json();
      const codesData = await codesRes.json();
      const analyticsData = await analyticsRes.json();
      const commentsData = await commentsRes.json();
      const themeData = await themeRes.json();
      if (usersData.success) setUsers(usersData.data);
      if (codesData.success) setCodes(codesData.data || {});
      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (commentsData.success) setComments(commentsData.data || []);
      if (themeData.success && themeData.data) {
        setSiteName(themeData.data.siteName || 'Z.XTREAM');
        setSiteDesc(themeData.data.siteDescription || '');
        setPrimaryColor(themeData.data.primaryColor || '#a78bfa');
        setAccentColor(themeData.data.accentColor || '#ec4899');
        setTelegramLink(themeData.data.telegramLink || '');
        const d = themeData.data.donation || {};
        setDonationEnabled(d.enabled || false);
        setDonationQR(d.qrUrl || '');
        setDonationDana(d.danaNumber || '');
        setDonationTelegram(d.telegramLink || '');
      }
    } catch (e) {
      console.error('Failed to fetch admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Generate code
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
        fetchAll();
      }
    } catch (e) {
      console.error('Failed to generate:', e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteCode = async (code: string) => {
    if (!currentUser) return;
    if (!confirm(`Delete code "${code}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/codes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, requesterUid: currentUser.uid }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Code deleted!');
        fetchAll();
      } else {
        toast.error(data.error || 'Gagal hapus code');
      }
    } catch {
      toast.error('Gagal hapus code');
    }
  };

  const handleSetRole = async (uid: string, role: string) => {
    if (!currentUser) return;
    const res = await fetch(`${API_BASE}/api/admin/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role, requesterUid: currentUser.uid }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Role updated!');
      fetchAll();
    } else {
      toast.error(data.error || 'Gagal update role');
    }
  };

  const handleBan = async (uid: string) => {
    if (!currentUser) return;
    const res = await fetch(`${API_BASE}/api/admin/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, requesterUid: currentUser.uid }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('User banned!');
      fetchAll();
    } else {
      toast.error(data.error || 'Gagal ban user');
    }
  };

  const handleUnban = async (uid: string) => {
    if (!currentUser) return;
    const res = await fetch(`${API_BASE}/api/admin/unban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, requesterUid: currentUser.uid }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('User unbanned!');
      fetchAll();
    } else {
      toast.error(data.error || 'Gagal unban user');
    }
  };

  const handleDeleteUser = async (uid: string, displayName: string) => {
    if (!currentUser) return;
    if (currentUser.uid === uid) {
      toast.error('Tidak bisa hapus diri sendiri!');
      return;
    }
    if (!confirm(`Hapus user "${displayName}" secara permanen?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, requesterUid: currentUser.uid }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User "${displayName}" berhasil dihapus!`);
        fetchAll();
      } else {
        toast.error(data.error || 'Gagal menghapus user');
      }
    } catch (e) {
      toast.error('Gagal menghapus user');
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!currentUser) return;
    if (!confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: comment.id,
          type: comment.type,
          targetId: comment.targetId,
          requesterUid: currentUser.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Comment deleted!');
        fetchAll();
      } else {
        toast.error(data.error || 'Gagal hapus comment');
      }
    } catch {
      toast.error('Gagal hapus comment');
    }
  };

  const handleSaveTheme = async () => {
    if (!currentUser) return;
    setSavingTheme(true);
    try {
      await fetch(`${API_BASE}/api/admin/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterUid: currentUser.uid,
          settings: { siteName, siteDescription: siteDesc, primaryColor, accentColor, telegramLink },
        }),
      });
    } catch {} finally {
      setSavingTheme(false);
    }
  };

  const handleSaveDonation = async () => {
    if (!currentUser) return;
    setSavingDonation(true);
    try {
      await fetch(`${API_BASE}/api/admin/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterUid: currentUser.uid,
          settings: {
            donation: {
              enabled: donationEnabled,
              qrUrl: donationQR,
              danaNumber: donationDana,
              telegramLink: donationTelegram,
            },
          },
        }),
      });
    } catch {} finally {
      setSavingDonation(false);
    }
  };

  const handleBroadcast = async () => {
    if (!currentUser || !broadcastTitle.trim() || !broadcastMsg.trim()) return;
    setSendingBroadcast(true);
    try {
      await fetch(`${API_BASE}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterUid: currentUser.uid,
          title: broadcastTitle.trim(),
          message: broadcastMsg.trim(),
        }),
      });
      setBroadcastTitle('');
      setBroadcastMsg('');
      toast.success('Broadcast sent!');
    } catch {} finally {
      setSendingBroadcast(false);
    }
  };

  // Delete all non-premium users
  const handleDeleteNonPremium = async () => {
    if (!currentUser) return;
    if (!confirm('DELETE ALL non-premium users (member only)? This cannot be undone!')) return;
    if (!confirm('ARE YOU REALLY SURE? This deletes ALL member accounts!')) return;

    const nonPremium = users.filter(u => !u.isOwner && u.role === 'member' && u.uid !== currentUser.uid);
    let deleted = 0;
    let failed = 0;
    for (const u of nonPremium) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/delete-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: u.uid, requesterUid: currentUser.uid }),
        });
        const data = await res.json();
        if (data.success) deleted++;
        else failed++;
      } catch {
        failed++;
      }
    }
    toast.success(`Berhasil hapus ${deleted} user${failed > 0 ? `, ${failed} gagal` : ''}`);
    fetchAll();
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

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
    { id: 'users', label: 'Users', icon: HiOutlineUserGroup },
    { id: 'codes', label: 'Codes', icon: HiOutlinePlus },
    { id: 'theme', label: 'Theme', icon: HiOutlineColorSwatch },
    { id: 'donations', label: 'Donasi', icon: HiOutlineCurrencyDollar },
    { id: 'comments', label: 'Comments', icon: HiOutlineChat },
    { id: 'broadcast', label: 'Broadcast', icon: HiOutlineBell },
    { id: 'notifications', label: 'Notifikasi', icon: HiOutlineBell },
    { id: 'hero', label: 'Hero Slider', icon: HiOutlineGlobe },
  ];

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <HiOutlineCog className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <RoleBadge role="owner" size="sm" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-gray-400 hover:bg-white/10 whitespace-nowrap transition-all"
          >
            <HiOutlineGlobe className="w-4 h-4" />
            Settings
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: analytics?.totalUsers || 0, color: 'purple' },
                    { label: 'Total Codes', value: analytics?.totalCodes || 0, color: 'green' },
                    { label: 'Banned Users', value: analytics?.bannedUsers || 0, color: 'red' },
                    { label: 'Total Views', value: analytics?.totalViews || 0, color: 'blue' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className={`text-2xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h3 className="font-bold mb-3">Role Distribution</h3>
                  <div className="flex gap-4 flex-wrap">
                    {Object.entries(analytics?.roles || {}).map(([role, count]) => (
                      <div key={role} className="flex items-center gap-2">
                        <RoleBadge role={role} size="sm" />
                        <span className="text-sm text-gray-400">× {count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full max-w-sm px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    onClick={handleDeleteNonPremium}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-colors ml-3 flex-shrink-0"
                  >
                    <HiOutlineExclamation className="w-4 h-4" />
                    Hapus Non-Premium
                  </button>
                </div>
                <div className="space-y-2">
                  {users
                    .filter(u => !userSearch || u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || u.uid.includes(userSearch))
                    .map((user) => (
                    <div key={user.uid} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl ${user.banned ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img src={user.photoURL || '/images/default-avatar.png'} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{user.displayName}</span>
                            <RoleBadge role={user.role} size="sm" showLabel={false} />
                            {user.banned && <span className="text-xs text-red-400">BANNED</span>}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{user.uid} | Lvl {user.level} | {user.totalExp} EXP</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 flex-wrap sm:flex-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleSetRole(user.uid, e.target.value)}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="vip">VIP</option>
                          <option value="vvip">VVIP</option>
                          <option value="owner">Owner</option>
                        </select>
                        {user.banned ? (
                          <button onClick={() => handleUnban(user.uid)} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">Unban</button>
                        ) : (
                          <button onClick={() => handleBan(user.uid)} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs">Ban</button>
                        )}
                        {!user.isOwner && user.uid !== currentUser?.uid && (
                          <button onClick={() => handleDeleteUser(user.uid, user.displayName)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors" title="Hapus user">
                            <HiOutlineTrash className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CODES TAB */}
            {tab === 'codes' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Generate New Code</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Type</label>
                      <select value={codeType} onChange={(e) => setCodeType(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50">
                        <option value="dev">Developer</option>
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
                      <input type="number" value={codeMaxUses} onChange={(e) => setCodeMaxUses(e.target.value)} min="1"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Description</label>
                      <input type="text" value={codeDesc} onChange={(e) => setCodeDesc(e.target.value)} placeholder="Optional"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                    </div>
                  </div>
                  <button onClick={handleGenerateCode} disabled={generating}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
                    {generating ? 'Generating...' : 'Generate Code'}
                  </button>
                  {newCode && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-sm text-green-400">New code generated:</p>
                      <p className="text-xl font-mono font-bold text-white tracking-widest mt-1">{newCode}</p>
                    </motion.div>
                  )}
                </div>

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
                          <button onClick={() => handleDeleteCode(code)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    {Object.keys(codes).length === 0 && <p className="text-gray-500 text-center py-4">No codes generated yet</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* THEME TAB */}
            {tab === 'theme' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Site Theme</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Site Name</label>
                    <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Site Description</label>
                    <textarea value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Primary Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                        <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Accent Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                        <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Telegram Group Link</label>
                    <div className="flex gap-2">
                      <HiOutlineLink className="w-5 h-5 text-gray-400 mt-2" />
                      <input type="url" value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)}
                        placeholder="https://t.me/..."
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                    </div>
                  </div>
                  <button onClick={handleSaveTheme} disabled={savingTheme}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
                    {savingTheme ? 'Saving...' : 'Save Theme'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* DONATIONS TAB */}
            {tab === 'donations' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Donation Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Enable Donation Section</span>
                    <input
                      type="checkbox"
                      checked={donationEnabled}
                      onChange={(e) => setDonationEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600"
                    />
                  </label>
                  {donationEnabled && (
                    <>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">QR Code Image URL</label>
                        <input type="url" value={donationQR} onChange={(e) => setDonationQR(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                        <p className="text-xs text-gray-500 mt-1">Upload QR image ke imgur atau hosting lain, paste linknya</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Nomor Dana</label>
                        <input type="text" value={donationDana} onChange={(e) => setDonationDana(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Telegram Group Link</label>
                        <input type="url" value={donationTelegram} onChange={(e) => setDonationTelegram(e.target.value)}
                          placeholder="https://t.me/..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                      </div>
                    </>
                  )}
                  <button onClick={handleSaveDonation} disabled={savingDonation}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
                    {savingDonation ? 'Saving...' : 'Save Donation Settings'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* COMMENTS TAB */}
            {tab === 'comments' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-sm text-gray-400 mb-4">{comments.length} total comments</p>
                <div className="space-y-2">
                  {comments.slice(0, 50).map((c) => (
                    <div key={c.id} className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                      <img src={c.photoURL || '/images/default-avatar.png'} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.displayName}</span>
                          <span className="text-xs text-gray-500">on {c.targetId}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">{c.text}</p>
                      </div>
                      <button onClick={() => handleDeleteComment(c)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* BROADCAST TAB */}
            {tab === 'broadcast' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Broadcast Notification</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Title</label>
                    <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="Notification title..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Message</label>
                    <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} rows={4}
                      placeholder="Write your broadcast message..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none" />
                  </div>
                  <button onClick={handleBroadcast} disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastMsg.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
                    {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB */}
            {tab === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-2">Episode Update Notifikasi</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Saat anime dapat episode baru, user yang subscribe notif akan dapat push notification dengan custom message.
                  Message di-random dari daftar per genre.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                  <h3 className="font-bold mb-2">Cara Kerja</h3>
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Cron scraper jalan setiap 3 jam (GitHub Actions)</li>
                    <li>Scrape ongoing & completed dari anichin</li>
                    <li>Bandingkan episode terakhir dengan yang tersimpan di Firebase</li>
                    <li>Jika episode bertambah → buat notifikasi baru</li>
                    <li>Push notification dikirim ke semua user yang subscribe</li>
                  </ul>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                  <h3 className="font-bold mb-2">Custom Messages per Genre</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Setiap genre punya message template yang di-random. Gunakan <code className="bg-white/10 px-1 rounded">{'{title}'}</code> dan <code className="bg-white/10 px-1 rounded">{'{ep}'}</code> sebagai placeholder.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-dark-800/50 p-3 rounded-lg">
                      <div className="text-xs text-purple-400 font-mono mb-1">default</div>
                      <div className="text-xs text-gray-400">Generic notification untuk semua anime</div>
                    </div>
                    <div className="bg-dark-800/50 p-3 rounded-lg">
                      <div className="text-xs text-red-400 font-mono mb-1">action</div>
                      <div className="text-xs text-gray-400">Anime action/battle</div>
                    </div>
                    <div className="bg-dark-800/50 p-3 rounded-lg">
                      <div className="text-xs text-pink-400 font-mono mb-1">romance</div>
                      <div className="text-xs text-gray-400">Anime romance/cinta</div>
                    </div>
                    <div className="bg-dark-800/50 p-3 rounded-lg">
                      <div className="text-xs text-yellow-400 font-mono mb-1">comedy</div>
                      <div className="text-xs text-gray-400">Anime comedy/komedi</div>
                    </div>
                    <div className="bg-dark-800/50 p-3 rounded-lg">
                      <div className="text-xs text-blue-400 font-mono mb-1">fantasy</div>
                      <div className="text-xs text-gray-400">Anime fantasy/sihir</div>
                    </div>
                    <div className="bg-dark-800/50 p-3 rounded-lg">
                      <div className="text-xs text-green-400 font-mono mb-1">cultivation</div>
                      <div className="text-xs text-gray-400">Donghua cultivation/xianxia</div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-sm text-yellow-400">
                    Custom message per genre sudah di-hardcode di <code className="bg-white/10 px-1 rounded">scripts/scrape-to-firebase.js</code>.
                    Edit file tersebut untuk mengubah message templates.
                  </p>
                </div>
              </motion.div>
            )}

            {/* HERO SLIDES TAB */}
            {tab === 'hero' && (
              <HeroSlidesTab />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
