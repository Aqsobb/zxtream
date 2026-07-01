'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCog, HiOutlineUserGroup, HiOutlineStar, HiOutlineClock, HiOutlineCollection, HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineHeart, HiOutlineFire, HiOutlineEye } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import AvatarFrame from '@/components/ui/AvatarFrame';
import RoleBadge, { RoleName, OwnerInfoSection, DevInfoSection } from '@/components/ui/RoleBadge';
import { getLevelForExp, getProgressPercent } from '@/lib/levels';
import { getRoleConfig } from '@/lib/roles';
import { API_BASE } from '@/lib/config';

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  country: string;
  level: number;
  exp: number;
  totalExp: number;
  title: string;
  role: string;
  badges: string[];
  achievements: string[];
  watchTime: number;
  followers: string[];
  following: string[];
  createdAt: number;
}

export default function ProfilePage() {
  const params = useParams();
  const uid = params.uid as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [uid]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/profile/${uid}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        setIsOwnProfile(currentUser?.uid === uid);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.uid, followingId: uid }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.data.isFollowing);
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6">
          <div className="h-64 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-36 w-36 rounded-3xl bg-white/5 animate-pulse -mt-18 mx-auto" />
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse mx-auto mt-4" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
        </div>
      </MainLayout>
    );
  }

  const levelInfo = getLevelForExp(profile.totalExp);
  const progress = getProgressPercent(profile.totalExp);
  const roleConfig = getRoleConfig(profile.role);
  const isPremium = profile.role === 'owner' || profile.role === 'vvip' || profile.role === 'vip' || profile.role === 'dev';
  const isDev = profile.role === 'dev';
  const isOwner = profile.role === 'owner';
  const isVVIP = profile.role === 'vvip';

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        {/* Epic Banner */}
        <div
          className="relative h-48 lg:h-64 rounded-3xl overflow-hidden mb-6"
          style={{ background: roleConfig.bannerGradient }}
        >
          {/* Animated overlay effects */}
          {isOwner && (
            <>
              <motion.div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.3), transparent 70%)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-yellow-400"
                  style={{ left: `${10 + Math.random() * 80}%`, bottom: '0%' }}
                  animate={{
                    y: [0, -200 - Math.random() * 100],
                    opacity: [1, 0],
                    scale: [1, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
          {isDev && (
            <>
              {/* Galaxy nebula */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(99,102,241,0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.15) 0%, transparent 60%)',
                }}
                animate={{
                  background: [
                    'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(99,102,241,0.2) 0%, transparent 50%)',
                    'radial-gradient(ellipse at 60% 30%, rgba(168,85,247,0.3) 0%, transparent 50%), radial-gradient(ellipse at 40% 70%, rgba(139,92,246,0.25) 0%, transparent 50%)',
                    'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(99,102,241,0.2) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Stars */}
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${1 + Math.random() * 2}px`,
                    height: `${1 + Math.random() * 2}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.5, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 1 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                  }}
                />
              ))}
              {/* Lightning bolts */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`bolt-${i}`}
                  className="absolute w-0.5 bg-purple-400 rounded-full"
                  style={{
                    height: `${20 + Math.random() * 40}px`,
                    left: `${15 + i * 18}%`,
                    top: `${10 + Math.random() * 40}%`,
                    opacity: 0.6,
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scaleY: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    delay: i * 1.5 + Math.random(),
                    repeatDelay: 2 + Math.random() * 3,
                  }}
                />
              ))}
              {/* Floating code symbols */}
              {['{ }', '< />', '=>', '&&', '||'].map((sym, i) => (
                <motion.div
                  key={`code-${i}`}
                  className="absolute text-purple-400/20 text-xs font-mono"
                  style={{ left: `${10 + i * 20}%`, top: '20%' }}
                  animate={{ y: [0, -80], opacity: [0.3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                >
                  {sym}
                </motion.div>
              ))}
            </>
          )}
          {isVVIP && (
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(168,85,247,0.2) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
              }}
              animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />

          {/* Back button */}
          <Link href="/home" className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-sm rounded-xl text-white hover:bg-black/60 transition-colors z-10">
            ← Kembali
          </Link>
        </div>

        {/* Profile Card */}
        <div className="-mt-24 relative z-10">
          <div
            className="relative overflow-hidden rounded-2xl border"
            style={{
              borderColor: roleConfig.color + '40',
              boxShadow: roleConfig.glow !== 'none' ? roleConfig.glow : '0 0 30px rgba(0,0,0,0.5)',
              background: 'rgba(17,24,39,0.95)',
            }}
          >
            {/* Animated border for owner */}
            {isOwner && (
              <motion.div
                className="absolute -inset-[1px] rounded-2xl pointer-events-none"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${roleConfig.color}60, transparent, ${roleConfig.color}60, transparent)`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {/* Galaxy rotating border for dev */}
            {isDev && (
              <>
                <motion.div
                  className="absolute -inset-[2px] rounded-2xl pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, 
                      transparent, rgba(139,92,246,0.6) 8%, 
                      transparent 16%,
                      rgba(99,102,241,0.5) 24%, 
                      transparent 32%,
                      rgba(168,85,247,0.4) 40%,
                      transparent 48%,
                      rgba(6,182,212,0.5) 56%,
                      transparent 64%,
                      rgba(139,92,246,0.6) 72%,
                      transparent 80%,
                      rgba(99,102,241,0.5) 88%,
                      transparent
                    )`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute -inset-4 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(99,102,241,0.15)',
                      '0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(168,85,247,0.25)',
                      '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(99,102,241,0.15)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </>
            )}

            <div className="relative z-10 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <AvatarFrame
                    src={profile.photoURL}
                    role={profile.role}
                    size="xl"
                  />
                  {isOwnProfile && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-[10px] font-bold text-white shadow-lg"
                    >
                      KAMU
                    </motion.div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
                    <RoleName name={profile.displayName} role={profile.role} className="text-2xl lg:text-3xl" />
                    <RoleBadge role={profile.role} size="md" />
                  </div>
                  {profile.title && (
                    <p className="text-sm mt-1 italic" style={{ color: roleConfig.color }}>
                      &quot;{profile.title}&quot;
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">UID: {profile.uid}</p>

                  {/* Level Progress */}
                  <div className="mt-4 max-w-md">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium" style={{ color: roleConfig.color }}>Level {profile.level}</span>
                      <span className="text-xs text-gray-400">{profile.totalExp} EXP</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${roleConfig.color}, ${roleConfig.color}80)`,
                          boxShadow: `0 0 10px ${roleConfig.color}60`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-gray-200 text-center lg:text-left">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Owner/Dev Info */}
        {isOwner && <OwnerInfoSection />}
        {isDev && (
          <div className="mt-6 space-y-4">
            <DevInfoSection />

            {/* Dev Control Panel */}
            {isOwnProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden rounded-2xl border border-purple-500/30 p-6"
                style={{
                  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #0f0c29 100%)',
                  boxShadow: '0 0 30px rgba(139,92,246,0.15)',
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >⚡</motion.span>
                  <h3 className="text-lg font-extrabold text-purple-400">⚡ DEV CONTROL PANEL</h3>
                </div>
                <p className="text-xs text-purple-300/50 mb-4">Kamu bisa kontrol semua fitur dari sini.</p>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: 'Admin Panel', icon: '🛡️', desc: 'Kelola user, codes, theme', href: '/admin', color: '#06b6d4' },
                    { label: 'Broadcast', icon: '📢', desc: 'Kirim notif ke semua', href: '/admin', color: '#8b5cf6' },
                    { label: 'Hero Slider', icon: '🖼️', desc: 'Kelola slide homepage', href: '/admin', color: '#a855f7' },
                    { label: 'Settings', icon: '⚙️', desc: 'Pengaturan akun', href: '/settings', color: '#6366f1' },
                    { label: 'Leaderboard', icon: '🏆', desc: 'Lihat ranking user', href: '/leaderboard', color: '#f59e0b' },
                    { label: 'Browse Anime', icon: '🎌', desc: 'Cari & kelola anime', href: '/browse/populer', color: '#ec4899' },
                  ].map((action, i) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <a
                        href={action.href}
                        className="block p-3 rounded-xl border transition-all hover:scale-105"
                        style={{
                          background: `${action.color}08`,
                          borderColor: `${action.color}25`,
                        }}
                      >
                        <span className="text-xl">{action.icon}</span>
                        <p className="text-sm font-bold text-white mt-1">{action.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { icon: HiOutlineClock, value: Math.floor(profile.watchTime / 3600), label: 'Jam Nonton', color: roleConfig.color },
            { icon: HiOutlineUserGroup, value: profile.followers?.length || 0, label: 'Followers', color: '#ec4899' },
            { icon: HiOutlineHeart, value: profile.following?.length || 0, label: 'Following', color: '#f43f5e' },
            { icon: HiOutlineStar, value: profile.badges?.length || 0, label: 'Badges', color: '#eab308' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden p-4 rounded-2xl border border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <div
                className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-10"
                style={{ background: stat.color }}
              />
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl"
          >
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <HiOutlineCollection className="w-5 h-5" style={{ color: roleConfig.color }} />
              Badges
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, i) => (
                <motion.div
                  key={badge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{
                    background: `${roleConfig.color}15`,
                    borderColor: `${roleConfig.color}30`,
                    color: roleConfig.color,
                  }}
                >
                  {badge}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {isOwnProfile ? (
            <>
              {!isPremium && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  <HiOutlineSparkles className="w-5 h-5" />
                  Upgrade Premium
                </button>
              )}
              {(isOwner || isDev) && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all ${
                    isDev
                      ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-purple-500/25 hover:shadow-purple-500/40'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/25 hover:shadow-purple-500/40'
                  }`}
                >
                  <HiOutlineShieldCheck className="w-5 h-5" />
                  {isDev ? '⚡ DEV Panel' : 'Admin Panel'}
                </Link>
              )}
              <Link
                href="/settings"
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                <HiOutlineCog className="w-5 h-5" />
                Settings
              </Link>
            </>
          ) : (
            <button
              onClick={handleFollow}
              className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                isFollowing
                  ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HiOutlineSparkles className="text-purple-400" />
                Upgrade ke Premium
              </h3>
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <RoleBadge role="vip" size="sm" />
                  </div>
                  <p className="text-xs text-gray-400">Akses semua server, badge VIP, efek khusus, custom profil statis</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <RoleBadge role="vvip" size="sm" />
                  </div>
                  <p className="text-xs text-gray-400">Semua fitur VIP + Diamond badge + Avatar animasi + Banner gacor + Prioritas</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Minta code premium ke Owner via Telegram, lalu redeem di{' '}
                <Link href="/redeem" className="text-purple-400 hover:underline">Redeem Code</Link>
              </p>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
