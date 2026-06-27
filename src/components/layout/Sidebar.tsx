'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome,
  HiOutlineSearch,
  HiOutlineBookmark,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineLogin,
  HiOutlineFire,
  HiOutlineGlobe,
  HiOutlineGift,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { FaFire, FaCrown, FaUserShield } from 'react-icons/fa';
import RoleBadge from '@/components/ui/RoleBadge';

const navItems = [
  { href: '/home', label: 'Home', icon: HiHome },
  { href: '/search', label: 'Search', icon: HiOutlineSearch },
  { href: '/bookmarks', label: 'Bookmarks', icon: HiOutlineBookmark },
  { href: '/history', label: 'History', icon: HiOutlineClock },
  { href: '/leaderboard', label: 'Leaderboard', icon: HiOutlineChartBar },
  { href: '/redeem', label: 'Redeem Code', icon: HiOutlineGift },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check auth state
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 glass rounded-xl lg:hidden"
      >
        {isOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-3 px-6 py-5 border-b border-dark-700/50">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-pink rounded-xl flex items-center justify-center">
              <FaFire className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">Z.XTREAM</h1>
              <p className="text-xs text-dark-400">Watch Anime Free</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-3 py-4 border-t border-dark-700/50">
            {user ? (
              <div className="space-y-2">
                <Link
                  href={`/profile/${user.uid}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-dark-800 transition-all duration-200"
                >
                  <img
                    src={user.photoURL || '/images/default-avatar.png'}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                    style={{
                      boxShadow: (user.role === 'owner' || user.role === 'vvip')
                        ? `0 0 12px ${(user.role === 'owner' ? '#f59e0b' : '#a855f7')}60`
                        : undefined
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <RoleBadge role={user.role || 'member'} size="sm" showLabel={false} />
                      <span className="text-xs text-dark-400">Lv.{user.level || 1}</span>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all duration-200"
                >
                  <HiOutlineCog className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </Link>

                {(user.isAdmin || user.role === 'owner' || user.isOwner) && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all duration-200"
                  >
                    <FaUserShield className="w-5 h-5" />
                    <span className="text-sm">Admin Panel</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all duration-200"
                >
                  <HiOutlineLogin className="w-5 h-5" />
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all duration-200"
                >
                  <HiOutlineUser className="w-5 h-5" />
                  <span className="text-sm">Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
