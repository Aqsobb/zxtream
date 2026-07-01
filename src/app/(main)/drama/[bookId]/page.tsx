'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineShare, HiOutlineClock, HiOutlineStar, HiOutlineBookmark } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import Comments from '@/components/anime/Comments';
import { API_BASE } from '@/lib/config';

export default function DramaDetailPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [drama, setDrama] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    fetchDramaDetail();
    fetchEpisodes();
  }, [bookId]);

  const fetchDramaDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/drama/detail/${bookId}`);
      const data = await res.json();
      if (data.success && data.data) setDrama(data.data);
    } catch {} finally { setLoading(false); }
  };

  const fetchEpisodes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/drama/episodes/${bookId}`);
      const data = await res.json();
      if (data.success && data.data) setEpisodes(data.data);
    } catch {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6 space-y-4">
          <div className="h-64 lg:h-96 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-8 w-64 bg-white/5 rounded animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  if (!drama) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6 text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Drama tidak ditemukan</h1>
          <Link href="/search" className="inline-block mt-4 px-6 py-2 bg-purple-600 rounded-xl text-white font-medium hover:bg-purple-500 transition-colors">
            Cari Drama
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden mb-8">
          <img src={drama.thumbnail} alt={drama.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/50 to-transparent" />
        </div>

        <div className="-mt-32 relative z-10 px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-shrink-0">
              <img src={drama.thumbnail} alt={drama.title} className="w-44 lg:w-56 rounded-2xl shadow-2xl shadow-black/50 border border-white/10" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <h1 className="text-2xl lg:text-4xl font-extrabold mb-4">{drama.title}</h1>

              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/20">
                  {drama.source === 'dramabox' ? 'Short Drama' : 'Drama'}
                </span>
                {drama.info?.totalepisode && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <HiOutlinePlay className="w-4 h-4" />
                    {drama.info.totalepisode} Episode
                  </span>
                )}
              </div>

              {drama.genres && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {(Array.isArray(drama.genres) ? drama.genres : drama.genres.split(',')).map((g: string) => g.trim()).filter(Boolean).map((genre: string) => (
                    <span key={genre} className="px-3 py-1.5 bg-white/5 text-sm rounded-lg border border-white/5">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {drama.synopsis && (
                <p className="text-gray-300 mb-6 leading-relaxed line-clamp-4 lg:line-clamp-none">{drama.synopsis}</p>
              )}

              <div className="flex flex-wrap gap-3">
                {episodes.length > 0 && (
                  <Link
                    href={`/watch/drama/${bookId}/1`}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl font-semibold hover:from-green-500 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-green-500/25"
                  >
                    <HiOutlinePlay className="w-5 h-5" />
                    Tonton Sekarang
                  </Link>
                )}
                <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3.5 bg-white/5 text-white rounded-2xl font-medium hover:bg-white/10 transition-all duration-200 border border-white/10">
                  <HiOutlineShare className="w-5 h-5" />
                  Share
                </button>
              </div>
            </motion.div>
          </div>

          {episodes.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
              <h2 className="text-xl font-bold mb-5">Episodes ({episodes.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {episodes.map((ep, i) => (
                  <Link
                    key={i}
                    href={`/watch/drama/${bookId}/${ep.number}`}
                    className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-green-500/30"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{ep.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">{ep.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          <Comments type="drama" targetId={bookId} />
        </div>
      </div>
    </MainLayout>
  );
}
