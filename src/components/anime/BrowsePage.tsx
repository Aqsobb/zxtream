'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import AnimeCard from '@/components/anime/AnimeCard';
import { API_BASE } from '@/lib/config';

interface BrowseItem {
  title: string;
  slug: string;
  thumbnail: string;
  episode?: string;
  episodeNum?: string;
  type?: string;
  url: string;
}

interface BrowsePageProps {
  title: string;
  icon: React.ReactNode;
  apiEndpoint: string;
  accentColor: string;
}

export default function BrowsePage({ title, icon, apiEndpoint, accentColor }: BrowsePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const accentColorMap: Record<string, string> = {
    purple: 'rgba(168,85,247,0.1)',
    pink: 'rgba(236,72,153,0.1)',
    cyan: 'rgba(6,182,212,0.1)',
    orange: 'rgba(249,115,22,0.1)',
    green: 'rgba(34,197,94,0.1)',
    red: 'rgba(239,68,68,0.1)',
    yellow: 'rgba(234,179,8,0.1)',
    blue: 'rgba(59,130,246,0.1)',
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}${apiEndpoint}${apiEndpoint.includes('?') ? '&' : '?'}page=${currentPage}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setItems(d.data);
          setHasMore(d.hasMore !== false && d.data.length >= 20);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentPage, apiEndpoint]);

  const goToPage = (p: number) => {
    router.push(`?page=${p}`);
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl" style={{ backgroundColor: accentColorMap[accentColor] || accentColorMap.purple }}>
            {icon}
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-400 text-lg">Tidak ada data</p>
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

            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-4 py-2 bg-dark-800 border border-dark-600 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-700 transition-colors"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="px-4 py-2 text-sm text-dark-400">
                Halaman {currentPage}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasMore}
                className="flex items-center gap-1 px-4 py-2 bg-dark-800 border border-dark-600 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-700 transition-colors"
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
