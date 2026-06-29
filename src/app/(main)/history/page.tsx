'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlinePlay } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import { API_BASE } from '@/lib/config';

interface HistoryItem {
  animeId: string;
  animeSlug: string;
  episodeId: string;
  episodeNumber: number;
  title: string;
  thumbnail: string;
  timestamp: number;
  progress: number;
  duration: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    let user;
    try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/progress?userId=${user.uid}`);
      const data = await res.json();
      if (data.success && data.data) {
        const items = Object.values(data.data) as HistoryItem[];
        setHistory(items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hari ini';
    if (days === 1) return 'Kemarin';
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID');
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-bold mb-6">Riwayat Tontonan</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineClock className="w-16 h-16 mx-auto text-dark-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Belum ada riwayat</h2>
            <p className="text-dark-400 mb-4">Mulai nonton donghua buat lihat riwayat</p>
            <Link href="/home" className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-500 transition-colors">
              Mulai Nonton
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <motion.div
                key={`${item.episodeId}-${item.timestamp}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/watch/${item.episodeId}`}
                  className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiOutlinePlay className="w-6 h-6 text-dark-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                      <HiOutlinePlay className="w-6 h-6 text-white" />
                    </div>
                    {/* Progress bar */}
                    {item.duration > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-700">
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${Math.min((item.progress / item.duration) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-white">{item.title || item.episodeId}</h3>
                    <p className="text-sm text-dark-400">
                      Episode {item.episodeNumber || '?'}
                    </p>
                    <p className="text-xs text-dark-500">{formatDate(item.timestamp)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
