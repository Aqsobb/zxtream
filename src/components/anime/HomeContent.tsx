'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineFire, HiOutlineClock, HiOutlineChevronRight, HiOutlineChevronLeft, HiOutlinePlay, HiOutlineCollection } from 'react-icons/hi';
import AnimeCard from './AnimeCard';
import EpisodeCard from './EpisodeCard';
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

interface EpisodeItem {
  title: string;
  slug: string;
  thumbnail: string;
  episode?: string;
  episodeNum?: string;
  type?: string;
  url: string;
}

export default function HomeContent() {
  const [popular, setPopular] = useState<AnimeItem[]>([]);
  const [recent, setRecent] = useState<EpisodeItem[]>([]);
  const [ongoing, setOngoing] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/anime/home`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPopular(d.data.popular || []);
          setRecent(d.data.recent || []);
          setOngoing(d.data.ongoing || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-10">
        {/* Hero skeleton */}
        <div className="h-48 bg-white/5 rounded-3xl animate-pulse" />
        {/* Section skeletons */}
        {[1, 2, 3].map(s => (
          <div key={s} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-5 w-24 bg-white/5 rounded-lg animate-pulse" />
            </div>
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
            <Link
              href="/redeem"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Redeem Code
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/8 rounded-full blur-[100px]" />
      </motion.section>

      {/* Populer Hari Ini — horizontal carousel */}
      {popular.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <HiOutlineFire className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold">Populer Hari Ini</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/browse/populer"
                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium mr-2"
              >
                Lihat Semua
                <HiOutlineChevronRight className="w-4 h-4" />
              </Link>
              <button onClick={() => scrollCarousel('left')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scrollCarousel('right')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          >
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

      {/* Ongoing Terupdate — horizontal carousel */}
      {ongoing.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <HiOutlinePlay className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Ongoing Terupdate</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/browse/ongoing"
                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium mr-2"
              >
                Lihat Semua
                <HiOutlineChevronRight className="w-4 h-4" />
              </Link>
            </div>
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

      {/* Episode Terbaru — grid */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <HiOutlineClock className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold">Episode Terbaru</h2>
            </div>
            <Link
              href="/search"
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Lihat Semua
              <HiOutlineChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recent.slice(0, 8).map((episode, i) => (
              <motion.div
                key={episode.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <EpisodeCard episode={episode} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
