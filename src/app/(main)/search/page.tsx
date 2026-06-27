'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
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
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Auto-search on mount if query exists
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    } else {
      inputRef.current?.focus();
    }
  }, [initialQuery]);

  const saveRecentSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const removeRecentSearch = (q: string) => {
    const updated = recentSearches.filter((s) => s !== q);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    saveRecentSearch(searchQuery.trim());
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
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Search Anime</h1>
        <form onSubmit={handleSubmit} className="relative max-w-2xl">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari anime..."
            className="w-full pl-12 pr-12 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 transition-all duration-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-dark-700 transition-colors"
            >
              <HiOutlineX className="w-4 h-4 text-dark-400" />
            </button>
          )}
        </form>
      </div>

      {/* Recent Searches */}
      {!hasSearched && recentSearches.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-dark-400 mb-3">Pencarian Terakhir</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q) => (
              <div key={q} className="flex items-center gap-1 bg-dark-800 border border-dark-600 rounded-lg">
                <button
                  onClick={() => handleRecentClick(q)}
                  className="px-3 py-1.5 text-sm text-white hover:text-purple-400 transition-colors"
                >
                  {q}
                </button>
                <button
                  onClick={() => removeRecentSearch(q)}
                  className="p-1 pr-2 text-dark-400 hover:text-white transition-colors"
                >
                  <HiOutlineX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
      ) : hasSearched && results.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineSearch className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Tidak ada hasil</h2>
          <p className="text-dark-400">Coba kata kunci lain</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-dark-400 mb-4">{results.length} hasil ditemukan</p>
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
      ) : (
        <div className="text-center py-12">
          <HiOutlineSearch className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Mulai mencari</h2>
          <p className="text-dark-400">Ketik kata kunci untuk menemukan anime</p>
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
