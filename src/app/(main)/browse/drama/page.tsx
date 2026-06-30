'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineFilm, HiOutlineChevronRight } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import { API_BASE } from '@/lib/config';

export default function BrowseDramaPage() {
  const [dramas, setDramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/drama/home`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setDramas(data.data.dramas || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <HiOutlineFilm className="w-6 h-6 text-green-400" />
          <h1 className="text-2xl font-bold">Short Drama</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : dramas.length === 0 ? (
          <div className="text-center py-20">
            <HiOutlineFilm className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Belum ada drama tersedia</p>
            <p className="text-sm text-gray-600 mt-2">Coba lagi nanti atau scrape ulang dari admin panel</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {dramas.map((drama, i) => (
              <motion.div
                key={drama.slug || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/drama/${drama.slug?.replace('drama-', '') || drama.bookId}`} className="group">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 mb-2 relative">
                    <img
                      src={drama.thumbnail}
                      alt={drama.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-[10px] text-green-400 font-medium bg-green-500/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        DRAMA
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-green-400 transition-colors">
                    {drama.title}
                  </p>
                  {drama.episode && (
                    <p className="text-xs text-gray-500 mt-1">{drama.episode} eps</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
