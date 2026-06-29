'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiOutlineFire, HiOutlineChevronRight, HiOutlinePlay,
  HiOutlineCollection, HiOutlineSparkles, HiOutlineStar, HiOutlineClock,
} from 'react-icons/hi';
import AnimeCard from './AnimeCard';
import HeroSlider from './HeroSlider';
import WeeklySchedule from './WeeklySchedule';
import { API_BASE } from '@/lib/config';

interface AnimeItem {
  title: string;
  slug: string;
  thumbnail: string;
  episode?: string;
  episodeNum?: string;
  type?: string;
  rating?: string;
  url: string;
}

interface ScheduleDay {
  name: string;
  items: { title: string; slug: string }[];
}

export default function HomeContent() {
  const [popular, setPopular] = useState<AnimeItem[]>([]);
  const [ongoing, setOngoing] = useState<AnimeItem[]>([]);
  const [completed, setCompleted] = useState<AnimeItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/anime/home`).then(r => r.json()),
      fetch(`${API_BASE}/api/anime/completed?page=1`).then(r => r.json()),
    ])
      .then(([homeData, completedData]) => {
        if (homeData.success) {
          setPopular(homeData.data.popular || []);
          setOngoing(homeData.data.ongoing || []);
          setSchedule(homeData.data.schedule || []);
        }
        if (completedData.success) {
          setCompleted(completedData.data?.items || completedData.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-8">
        {/* Hero skeleton */}
        <div className="h-[280px] sm:h-[360px] lg:h-[420px] bg-white/5 rounded-2xl animate-pulse" />
        {/* Schedule skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 w-20 bg-white/5 rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
        {/* Cards skeleton */}
        {[1, 2, 3].map(s => (
          <div key={s} className="space-y-4">
            <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 space-y-2">
                  <div className="aspect-[3/4] rounded-lg bg-white/5 animate-pulse" />
                  <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-8">
      {/* Hero Slider */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HeroSlider />
      </motion.section>

      {/* Weekly Schedule */}
      {schedule.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WeeklySchedule schedule={schedule} />
        </motion.section>
      )}

      {/* Populer Hari Ini */}
      {popular.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <HiOutlineFire className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold">Populer Hari Ini</h2>
            </div>
            <Link
              href="/browse/populer"
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Lihat Semua
              <HiOutlineChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {popular.map((anime, i) => (
              <motion.div
                key={anime.slug}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex-shrink-0 w-36"
              >
                <AnimeCard anime={{ ...anime, isHot: i < 3 }} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Rilisan Terbaru */}
      {ongoing.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <HiOutlinePlay className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Rilisan Terbaru</h2>
            </div>
            <Link
              href="/browse/ongoing"
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Lihat Semua
              <HiOutlineChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {ongoing.slice(0, 12).map((anime, i) => (
              <motion.div
                key={anime.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Movie / Completed */}
      {completed.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <HiOutlineCollection className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold">Movie / Completed</h2>
            </div>
            <Link
              href="/browse/completed"
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Lihat Semua
              <HiOutlineChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {completed.slice(0, 12).map((anime, i) => (
              <motion.div
                key={anime.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Quick Links */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/leaderboard', icon: HiOutlineStar, label: 'Leaderboard', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { href: '/bookmarks', icon: HiOutlineCollection, label: 'Bookmark Saya', color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { href: '/history', icon: HiOutlineClock, label: 'Riwayat', color: 'text-green-400', bg: 'bg-green-500/10' },
            { href: '/redeem', icon: HiOutlineSparkles, label: 'Redeem Code', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-4 rounded-2xl border border-white/5 ${item.bg} hover:bg-white/10 transition-all`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm font-medium text-white">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
