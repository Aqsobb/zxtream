'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineCog, HiOutlineUserGroup, HiOutlineStar, HiOutlineClock, HiOutlineCollection, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import RoleBadge, { ProfileCard } from '@/components/ui/RoleBadge';
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
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-32 w-32 rounded-full bg-white/5 animate-pulse -mt-16 mx-auto" />
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
  const isPremium = profile.role === 'owner' || profile.role === 'vvip' || profile.role === 'vip';
  const isDev = profile.role === 'dev';

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        {/* Profile Card with Role Effects */}
        <ProfileCard user={profile} className="mb-6" />

        {/* Role-specific role glow effect */}
        {isDev && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-center"
          >
            <span className="text-cyan-400 text-sm font-medium">⚡ Developer Mode Active — Full Access</span>
          </motion.div>
        )}
        {profile.role === 'owner' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center"
          >
            <span className="text-yellow-400 text-sm font-medium">👑 Boss Besar — Full Control</span>
          </motion.div>
        )}

        {/* Level Progress */}
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Level {profile.level}</span>
            <span className="text-sm text-gray-400">{profile.totalExp} EXP</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-gray-300 text-center lg:text-left">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <HiOutlineClock className="w-6 h-6 mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold">{Math.floor(profile.watchTime / 3600)}h</p>
            <p className="text-sm text-gray-500">Watch Time</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <HiOutlineUserGroup className="w-6 h-6 mx-auto text-pink-400 mb-2" />
            <p className="text-2xl font-bold">{profile.followers?.length || 0}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <HiOutlineStar className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">{profile.achievements?.length || 0}</p>
            <p className="text-sm text-gray-500">Achievements</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <HiOutlineCollection className="w-6 h-6 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold">{profile.badges?.length || 0}</p>
            <p className="text-sm text-gray-500">Badges</p>
          </div>
        </div>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">Badges</h2>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <div
                  key={badge}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {isOwnProfile ? (
            <>
              {!isPremium && !isDev && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  <HiOutlineSparkles className="w-5 h-5" />
                  Upgrade Premium
                </button>
              )}
              {(profile.role === 'owner' || profile.role === 'dev' || isOwnProfile) && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  <HiOutlineShieldCheck className="w-5 h-5" />
                  Admin Panel
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
                  <p className="text-xs text-gray-400">Akses semua server, badge VIP, efek khusus</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <RoleBadge role="vvip" size="sm" />
                  </div>
                  <p className="text-xs text-gray-400">Semua fitur VIP + Diamond badge + Banner gacor + Prioritas</p>
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
