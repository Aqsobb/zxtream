'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineBookOpen } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import AnimeCard from '@/components/anime/AnimeCard';
import { API_BASE } from '@/lib/config';

const LETTERS = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function AZListContent() {
  const searchParams = useSearchParams();
  const initialLetter = searchParams.get('letter') || '#';
  const [activeLetter, setActiveLetter] = useState(initialLetter);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAZList(activeLetter);
  }, [activeLetter]);

  const fetchAZList = async (letter: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/anime/az?letter=${encodeURIComponent(letter)}`);
      const data = await res.json();
      if (data.success) setResults(data.data || []);
    } catch (error) {
      console.error('Failed to fetch AZ list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-xl">
          <HiOutlineBookOpen className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold">A-Z List</h1>
      </div>

      {/* Letter navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() => setActiveLetter(letter)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
              activeLetter === letter
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-dark-700 animate-pulse aspect-[3/4] rounded-xl" />
              <div className="bg-dark-700 animate-pulse h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineBookOpen className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Tidak ada anime</h2>
          <p className="text-dark-400">Tidak ada anime untuk huruf {activeLetter}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-dark-400 mb-4">{results.length} anime ditemukan</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((anime, index) => (
              <motion.div
                key={anime.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AZListPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="p-4 lg:p-6 text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }>
        <AZListContent />
      </Suspense>
    </MainLayout>
  );
}
