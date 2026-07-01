'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineX, HiOutlineFilter } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import AnimeCard from '@/components/anime/AnimeCard';
import { API_BASE } from '@/lib/config';

interface SearchResult {
  title: string;
  slug: string;
  thumbnail: string;
  type?: string;
  episode?: string;
  url: string;
  _type?: string;
  bookId?: string;
}

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Martial Arts',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller',
  'Cultivation', 'Isekai', 'Mecha', 'Music', 'Mystery', 'Psychological',
  'School', 'Shounen', 'Sports', 'Historical', 'Demons', 'Ecchi',
  'Harem', 'Horror', 'Josei', 'Seinen', 'Vampire',
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery || !!initialGenre);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showGenreFilter, setShowGenreFilter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    } else if (initialGenre) {
      handleGenreSearch(initialGenre);
    } else {
      inputRef.current?.focus();
    }
  }, [initialQuery, initialGenre]);

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
    setSelectedGenre('');
    saveRecentSearch(searchQuery.trim());
    try {
      const res = await fetch(`${API_BASE}/api/anime/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        const mapped = (data.data || []).map((item: any) => ({
          ...item,
          type: item._type === 'drama' ? 'Drama' : (item._type === 'donghua' ? 'Donghua' : item.type),
          href: item._type === 'drama' ? `/drama/${item.bookId}` : undefined,
        }));
        setResults(mapped);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSearch = async (genre: string) => {
    if (!genre) return;
    setLoading(true);
    setHasSearched(true);
    setQuery('');
    try {
      const res = await fetch(`${API_BASE}/api/anime/genre?genre=${encodeURIComponent(genre)}`);
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch (error) {
      console.error('Genre search failed:', error);
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

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    setShowGenreFilter(false);
    router.push(`/search?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">
          {selectedGenre ? `Genre: ${selectedGenre}` : 'Search Anime'}
        </h1>
        <div className="flex gap-3 max-w-3xl">
          <form onSubmit={handleSubmit} className="relative flex-1">
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
          <button
            onClick={() => setShowGenreFilter(!showGenreFilter)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              selectedGenre
                ? 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                : 'bg-dark-800 border-dark-600 text-dark-300 hover:bg-dark-700'
            }`}
          >
            <HiOutlineFilter className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Genre</span>
          </button>
        </div>
      </div>

      {/* Genre Filter Panel */}
      {showGenreFilter && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-dark-800 rounded-xl border border-dark-600"
        >
          <h3 className="text-sm font-medium text-dark-400 mb-3">Pilih Genre</h3>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedGenre === genre
                    ? 'bg-purple-600 text-white'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Searches */}
      {!hasSearched && recentSearches.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-dark-400 mb-3">Pencarian Terakhir</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q) => (
              <div key={q} className="flex items-center gap-1 bg-dark-800 border border-dark-600 rounded-lg">
                <button
                  onClick={() => { setQuery(q); router.push(`/search?q=${encodeURIComponent(q)}`); }}
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
          <p className="text-dark-400">Coba kata kunci atau genre lain</p>
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
                <AnimeCard anime={anime} href={(anime as any).href} />
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <HiOutlineSearch className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Mulai mencari</h2>
          <p className="text-dark-400">Ketik kata kunci atau pilih genre untuk menemukan anime</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="p-4 lg:p-6 text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </MainLayout>
  );
}
