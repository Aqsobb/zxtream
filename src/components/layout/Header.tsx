'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineSearch, HiOutlineUser } from 'react-icons/hi';
import { io } from 'socket.io-client';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');
      socket.emit('user:online', user.uid);
      socket.on('notification:received', () => {
        setNotifications((prev) => prev + 1);
      });
      return () => {
        socket.emit('user:offline', user.uid);
        socket.disconnect();
      };
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left spacer for mobile */}
        <div className="w-12 lg:hidden" />

        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime..."
              className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
            />
          </form>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
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

              {/* Profile */}
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
