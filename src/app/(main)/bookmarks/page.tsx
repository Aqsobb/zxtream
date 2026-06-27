'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineBookmark } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import AnimeCard from '@/components/anime/AnimeCard';
import { API_BASE } from '@/lib/config';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/profile/${user.uid}`);
      const data = await res.json();
      if (data.success && data.data.bookmarks) {
        // Fetch anime details for each bookmark
        const animePromises = data.data.bookmarks.map(async (slug: string) => {
          const animeRes = await fetch(`${API_BASE}/api/anime/detail/${slug}`);
          const animeData = await animeRes.json();
          return animeData.success ? animeData.data : null;
        });
        const animeResults = await Promise.all(animePromises);
        setBookmarks(animeResults.filter(Boolean));
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-bold mb-6">Bookmarks</h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton aspect-[3/4] rounded-xl" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineBookmark className="w-16 h-16 mx-auto text-dark-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">No bookmarks yet</h2>
            <p className="text-dark-400 mb-4">Start bookmarking anime to see them here</p>
            <Link href="/search" className="btn-primary">
              Explore Anime
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bookmarks.map((anime, index) => (
              <motion.div
                key={anime.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
