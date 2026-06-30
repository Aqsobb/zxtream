'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineChartBar, HiOutlineClock, HiOutlineStar, HiOutlineCollection } from 'react-icons/hi';
import { FaCrown, FaMedal, FaAward } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import RoleBadge from '@/components/ui/RoleBadge';
import { API_BASE } from '@/lib/config';

interface LeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  photoURL: string;
  level: number;
  exp: number;
  totalExp: number;
  commentCount: number;
  title: string;
  role: string;
  badges: string[];
  watchTime: number;
  country: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('exp');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/leaderboard/${activeTab}?limit=100`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'exp', label: 'Top EXP', icon: HiOutlineStar },
    { id: 'watchtime', label: 'Watch Time', icon: HiOutlineClock },
    { id: 'comments', label: 'Most Comments', icon: HiOutlineChartBar },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <FaMedal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <FaMedal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-dark-400">#{rank}</span>;
    }
  };

  const formatStat = (entry: LeaderboardEntry) => {
    switch (activeTab) {
      case 'exp':
        return `${(entry.exp || entry.totalExp || 0).toLocaleString()} EXP`;
      case 'watchtime':
        const hours = Math.floor((entry.watchTime || 0) / 3600);
        const minutes = Math.floor(((entry.watchTime || 0) % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      case 'comments':
        return `${(entry as any).commentCount || 0} comments`;
      default:
        return '';
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineChartBar className="w-16 h-16 mx-auto text-dark-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">No data yet</h2>
            <p className="text-dark-400">Be the first to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/profile/${entry.uid}`}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                    entry.rank <= 3
                      ? 'glass border border-primary-500/30'
                      : 'bg-dark-800/50 hover:bg-dark-700/50'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <img
                    src={entry.photoURL || '/images/default-avatar.png'}
                    alt={entry.displayName}
                    className="w-12 h-12 rounded-full"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{entry.displayName}</h3>
                      <RoleBadge role={entry.role || 'member'} size="sm" showLabel={false} />
                    </div>
                    <p className="text-sm text-dark-400">{entry.title}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary-400">
                      {formatStat(entry)}
                    </p>
                    <p className="text-sm text-dark-400">Level {entry.level}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
