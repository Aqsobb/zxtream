'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineTag, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import AnimeCard from '@/components/anime/AnimeCard';
import { API_BASE } from '@/lib/config';

interface AnimeItem {
  title: string;
  slug: string;
  thumbnail: string;
  episode?: string;
  type?: string;
  url: string;
}

export default function GenrePage() {
  const params = useParams();
  const genre = decodeURIComponent(params.slug as string);
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchGenre();
  }, [genre, page]);

  const fetchGenre = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/anime/genre?genre=${encodeURIComponent(genre)}&page=${page}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch genre:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <HiOutlineTag className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold capitalize">{genre}</h1>
            <p className="text-sm text-gray-400">Semua donghua genre {genre.toLowerCase()}</p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineTag className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Tidak ada anime</h2>
            <p className="text-gray-400">Genre &quot;{genre}&quot; tidak ditemukan atau belum ada anime</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((anime, i) => (
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

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="text-sm text-gray-400">Halaman {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={items.length < 20}
                className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
              >
                Next
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
