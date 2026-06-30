'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiOutlineFire, HiOutlineChevronRight, HiOutlinePlay,
  HiOutlineCollection, HiOutlineSparkles, HiOutlineStar, HiOutlineClock,
  HiOutlineBookOpen, HiOutlineQuestionMarkCircle, HiOutlineFilm, HiOutlineFlag,
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

interface HeroSlide {
  title: string;
  slug: string;
  thumbnail: string;
  synopsis?: string;
}

interface ScheduleDay {
  name: string;
  items: { title: string; slug: string }[];
}

const TABS = [
  { key: 'semua', label: 'Semua', icon: HiOutlineFlag, color: 'text-purple-400' },
  { key: 'donghua', label: 'Donghua', icon: HiOutlinePlay, color: 'text-orange-400' },
  { key: 'drama', label: 'Drama', icon: HiOutlineFilm, color: 'text-green-400' },
];

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState('semua');
  const [popular, setPopular] = useState<AnimeItem[]>([]);
  const [ongoing, setOngoing] = useState<AnimeItem[]>([]);
  const [completed, setCompleted] = useState<AnimeItem[]>([]);
  const [upcoming, setUpcoming] = useState<AnimeItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [dramas, setDramas] = useState<AnimeItem[]>([]);
  const [movies, setMovies] = useState<AnimeItem[]>([]);
  const [dramaTrending, setDramaTrending] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/anime/home`).then(r => r.json()),
      fetch(`${API_BASE}/api/anime/completed?page=1`).then(r => r.json()),
      fetch(`${API_BASE}/api/anime/upcoming`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch(`${API_BASE}/api/drama/home`).then(r => r.json()).catch(() => ({ success: false, data: { dramas: [], movies: [] } })),
    ])
      .then(([homeData, completedData, upcomingData, dramaData]) => {
        if (homeData.success) {
          setPopular(homeData.data.popular || []);
          setOngoing(homeData.data.ongoing || []);
          setSchedule(homeData.data.schedule || []);
          if (homeData.data.hero?.length > 0) {
            setHeroSlides(homeData.data.hero);
          } else if (homeData.data.popular?.length > 0) {
            setHeroSlides(homeData.data.popular.slice(0, 5).map((a: any) => ({
              title: a.title, slug: a.slug, thumbnail: a.thumbnail, synopsis: '',
            })));
          }
        } else { setError(true); }
        if (completedData.success) setCompleted(completedData.data?.items || completedData.data || []);
        if (upcomingData.success) setUpcoming(upcomingData.data || []);
        if (dramaData.success) {
          setDramas(dramaData.data.dramas || []);
          setMovies(dramaData.data.movies || []);
          setDramaTrending(dramaData.data.dramas?.slice(0, 8) || []);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-8">
        <div className="h-[280px] sm:h-[360px] lg:h-[420px] bg-white/5 rounded-2xl animate-pulse" />
        <div className="flex gap-2 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 w-20 bg-white/5 rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
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

  if (error) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl">😵</div>
          <h2 className="text-2xl font-bold text-white">Gagal Memuat Data</h2>
          <p className="text-gray-400 max-w-md mx-auto">Terjadi kesalahan saat memuat konten.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 transition-all">
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const showDonghua = activeTab === 'semua' || activeTab === 'donghua';
  const showDrama = activeTab === 'semua' || activeTab === 'drama';

  return (
    <div className="p-4 lg:p-6 space-y-8">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.color : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {showDonghua && (
        <>
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HeroSlider slides={heroSlides} />
          </motion.section>

          {schedule.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <WeeklySchedule schedule={schedule} />
            </motion.section>
          )}

          {popular.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-xl">
                    <HiOutlineFire className="w-6 h-6 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold">Populer Hari Ini</h2>
                </div>
                <Link href="/browse/populer" className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
                  Lihat Semua <HiOutlineChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {popular.map((anime, i) => (
                  <motion.div key={anime.slug} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex-shrink-0 w-36">
                    <AnimeCard anime={{ ...anime, isHot: i < 3 }} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {ongoing.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-xl">
                    <HiOutlinePlay className="w-6 h-6 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold">Rilisan Terbaru</h2>
                </div>
                <Link href="/browse/ongoing" className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
                  Lihat Semua <HiOutlineChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {ongoing.slice(0, 12).map((anime, i) => (
                  <motion.div key={anime.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <AnimeCard anime={anime} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {completed.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <HiOutlineCollection className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold">Movie / Completed</h2>
                </div>
                <Link href="/browse/completed" className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
                  Lihat Semua <HiOutlineChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {completed.slice(0, 12).map((anime, i) => (
                  <motion.div key={anime.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <AnimeCard anime={anime} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </>
      )}

      {showDrama && dramas.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <HiOutlineFilm className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Short Drama Populer</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {dramas.slice(0, 12).map((drama, i) => (
              <motion.div key={drama.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/drama/${drama.slug?.replace('drama-', '')}`} className="group">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 mb-2 relative">
                    <img src={drama.thumbnail} alt={drama.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[10px] text-green-400 font-medium bg-green-500/20 px-1.5 py-0.5 rounded">DRAMA</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-green-400 transition-colors">{drama.title}</p>
                  {drama.episode && <p className="text-xs text-gray-500 mt-1">{drama.episode}</p>}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {movies.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl">
                <HiOutlineStar className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold">Movie / Film</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {movies.slice(0, 12).map((movie, i) => (
              <motion.div key={movie.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/drama/${movie.slug?.replace('movie-', '')}`} className="group">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 mb-2 relative">
                    <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[10px] text-cyan-400 font-medium bg-cyan-500/20 px-1.5 py-0.5 rounded">MOVIE</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-cyan-400 transition-colors">{movie.title}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { href: '/az-list', icon: HiOutlineBookOpen, label: 'A-Z List', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { href: '/leaderboard', icon: HiOutlineStar, label: 'Leaderboard', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { href: '/bookmarks', icon: HiOutlineCollection, label: 'Bookmark Saya', color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { href: '/history', icon: HiOutlineClock, label: 'Riwayat', color: 'text-green-400', bg: 'bg-green-500/10' },
            { href: '/redeem', icon: HiOutlineSparkles, label: 'Redeem Code', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-4 rounded-2xl border border-white/5 ${item.bg} hover:bg-white/10 transition-all`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm font-medium text-white">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
