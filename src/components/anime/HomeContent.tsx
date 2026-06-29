'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineFire, HiOutlineChevronRight, HiOutlinePlay, HiOutlineStar, HiOutlineCollection, HiOutlineSparkles } from 'react-icons/hi';
import AnimeCard from './AnimeCard';
import { OwnerInfoSection, DevInfoSection, DonationSection } from '@/components/ui/RoleBadge';
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

export default function HomeContent() {
  const [popular, setPopular] = useState<AnimeItem[]>([]);
  const [ongoing, setOngoing] = useState<AnimeItem[]>([]);
  const [completed, setCompleted] = useState<AnimeItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}

    Promise.all([
      fetch(`${API_BASE}/api/anime/home`).then(r => r.json()),
      fetch(`${API_BASE}/api/anime/completed?page=1`).then(r => r.json()),
    ])
      .then(([homeData, completedData]) => {
        if (homeData.success) {
          setPopular(homeData.data.popular || []);
          setOngoing(homeData.data.ongoing || []);
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
      <div className="p-4 lg:p-6 space-y-10">
        <div className="h-48 bg-white/5 rounded-3xl animate-pulse" />
        {[1, 2, 3].map(s => (
          <div key={s} className="space-y-4">
            <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 space-y-2">
                  <div className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
                  <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/5 p-8 lg:p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(88,28,135,0.3) 0%, rgba(8,8,10,1) 40%, rgba(157,23,77,0.2) 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[10%] w-2 h-2 bg-purple-400 rounded-full opacity-40 animate-[float_3s_ease-in-out_infinite]" />
          <div className="absolute top-20 left-[30%] w-1.5 h-1.5 bg-pink-400 rounded-full opacity-30 animate-[float_4s_ease-in-out_infinite_0.5s]" />
          <div className="absolute top-16 right-[20%] w-2.5 h-2.5 bg-purple-300 rounded-full opacity-20 animate-[float_5s_ease-in-out_infinite_1s]" />
          <div className="absolute bottom-10 left-[40%] w-3 h-3 bg-yellow-400 rounded-full opacity-20 animate-[float_4s_ease-in-out_infinite_1.5s]" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300 font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Updated Daily
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold mb-3 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Z.XTREAM
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-lg leading-relaxed">
            Nonton ribuan episode donghua sub Indo gratis. Update setiap hari dari anichin.moe.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
            >
              Explore Donghua
              <HiOutlineChevronRight className="w-5 h-5" />
            </Link>
            {user && (
              <Link
                href="/browse/ongoing"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300"
              >
                <HiOutlinePlay className="w-5 h-5" />
                Lanjut Nonton
              </Link>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/8 rounded-full blur-[100px]" />
      </motion.section>

      {/* Populer Hari Ini — swipe carousel */}
      {popular.length > 0 && (
        <section>
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
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {popular.map((anime, i) => (
              <motion.div
                key={anime.slug}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex-shrink-0 w-40"
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Ongoing Terupdate — grid */}
      {ongoing.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <HiOutlinePlay className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Ongoing Terupdate</h2>
            </div>
            <Link
              href="/browse/ongoing"
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Lihat Semua
              <HiOutlineChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ongoing.slice(0, 10).map((anime, i) => (
              <motion.div
                key={anime.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Completed / Movie Section */}
      {completed.length > 0 && (
        <section>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {completed.slice(0, 10).map((anime, i) => (
              <motion.div
                key={anime.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/leaderboard', icon: HiOutlineStar, label: 'Leaderboard', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { href: '/bookmarks', icon: HiOutlineCollection, label: 'Bookmark Saya', color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { href: '/history', icon: HiOutlinePlay, label: 'Riwayat', color: 'text-green-400', bg: 'bg-green-500/10' },
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
      </section>

      {/* About Sections */}
      <div className="space-y-6">
        <OwnerInfoSection />
        <DevInfoSection />
        <DonationSection />
      </div>
    </div>
  );
}
