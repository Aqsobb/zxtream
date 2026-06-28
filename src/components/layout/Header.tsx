'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineSearch, HiOutlineUser, HiOutlineX } from 'react-icons/hi';
import { API_BASE } from '@/lib/config';

interface SuggestItem {
  title: string;
  slug: string;
  thumbnail: string;
  type?: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      fetchNotificationCount(userData.uid);
    }
  }, []);

  const fetchNotificationCount = async (uid: string) => {
    try {
      // Check if user already visited notifications page
      const readTime = localStorage.getItem('notifications_read');
      const res = await fetch(`${API_BASE}/api/users/notifications?userId=${uid}`);
      const data = await res.json();
      if (data.success && data.data) {
        if (readTime) {
          // Only show notifications newer than last read time
          const unread = data.data.filter((n: any) => !n.read && n.createdAt > parseInt(readTime)).length;
          setNotifications(unread);
        } else {
          const unread = data.data.filter((n: any) => !n.read).length;
          setNotifications(unread);
        }
      }
    } catch {}
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim() || q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`${API_BASE}/api/anime/suggest?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setSuggestions(data.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchSuggestions(val);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    router.push(`/anime/${slug}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left spacer for mobile */}
        <div className="w-12 lg:hidden" />

        {/* Search bar with autocomplete */}
        <div className="flex-1 max-w-xl mx-auto" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search anime..."
              className="w-full pl-10 pr-10 py-2 bg-dark-800/50 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-dark-700 transition-colors"
              >
                <HiOutlineX className="w-4 h-4 text-dark-400" />
              </button>
            )}
          </form>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-2 bg-dark-800 border border-dark-600/50 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-50"
              >
                {suggestions.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => handleSuggestionClick(item.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-700/50 transition-colors text-left"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      {item.type && (
                        <span className="text-xs text-dark-400">{item.type}</span>
                      )}
                    </div>
                  </button>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowSuggestions(false)}
                  className="block px-4 py-3 text-sm text-purple-400 hover:bg-dark-700/50 transition-colors border-t border-dark-600/50 text-center font-medium"
                >
                  Lihat semua hasil untuk &quot;{searchQuery}&quot;
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading indicator */}
          <AnimatePresence>
            {loadingSuggestions && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-10 top-1/2 -translate-y-1/2"
              >
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative p-2 rounded-xl hover:bg-dark-800 transition-all duration-200"
              >
                <HiOutlineBell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-red text-white text-xs rounded-full flex items-center justify-center">
                    {notifications > 99 ? '99+' : notifications}
                  </span>
                )}
              </Link>
              <Link
                href={`/profile/${user.uid}`}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-dark-800 transition-all duration-200"
              >
                <img
                  src={user.photoURL || '/images/default-avatar.png'}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-500 transition-all duration-200"
            >
              <HiOutlineUser className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
