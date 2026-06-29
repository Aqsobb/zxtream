'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineBookmark, HiOutlineTrash } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import AnimeCard from '@/components/anime/AnimeCard';
import { API_BASE } from '@/lib/config';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    let user;
    try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.uid);

    try {
      const res = await fetch(`${API_BASE}/api/users/profile/${user.uid}`);
      const data = await res.json();
      if (data.success && data.data.bookmarks) {
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

  const removeBookmark = async (slug: string) => {
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/api/users/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, animeSlug: slug }),
      });
      setBookmarks(prev => prev.filter(b => b.slug !== slug));
    } catch {}
  };

  const clearAllBookmarks = async () => {
    if (!userId || bookmarks.length === 0) return;
    if (!confirm('Hapus semua bookmark?')) return;
    for (const anime of bookmarks) {
      await removeBookmark(anime.slug);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Bookmark Saya</h1>
          {bookmarks.length > 0 && (
            <button
              onClick={clearAllBookmarks}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Hapus Semua
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineBookmark className="w-16 h-16 mx-auto text-dark-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Belum ada bookmark</h2>
            <p className="text-dark-400 mb-4">Bookmark donghua favorit buat lihat di sini</p>
            <Link href="/search" className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-500 transition-colors">
              Cari Donghua
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
                className="relative group"
              >
                <AnimeCard anime={anime} />
                <button
                  onClick={() => removeBookmark(anime.slug)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 z-10"
                  title="Hapus bookmark"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
