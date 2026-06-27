'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineSearch } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import AnimeCard from '@/components/anime/AnimeCard';
import { API_BASE } from '@/lib/config';

interface SearchResult {
  title: string;
  slug: string;
  thumbnail: string;
  type?: string;
  status?: string;
  url: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) handleSearch(initialQuery);
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${API_BASE}/api/anime/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Search Anime</h1>
        <form onSubmit={handleSubmit} className="relative max-w-2xl">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime..."
            className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 transition-all duration-200"
          />
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-dark-700 animate-pulse aspect-[3/4] rounded-xl" />
              <div className="bg-dark-700 animate-pulse h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineSearch className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">No results found</h2>
          <p className="text-dark-400">Try searching with different keywords</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((anime, index) => (
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
      ) : (
        <div className="text-center py-12">
          <HiOutlineSearch className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Start searching</h2>
          <p className="text-dark-400">Enter a search term to find anime</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <MainLayout>
          <div className="p-4 lg:p-6 text-center py-12">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </MainLayout>
      }>
        <SearchContent />
      </Suspense>
    </MainLayout>
  );
}
