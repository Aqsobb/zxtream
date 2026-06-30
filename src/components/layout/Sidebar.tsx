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
  HiOutlinePlay,
  HiOutlineCheckCircle,
  HiOutlineCollection,
} from 'react-icons/hi';
import { FaFire, FaCrown, FaUserShield } from 'react-icons/fa';
import RoleBadge from '@/components/ui/RoleBadge';
import AvatarFrame from '@/components/ui/AvatarFrame';
import { API_BASE } from '@/lib/config';

const navItems = [
  { href: '/home', label: 'Home', icon: HiHome },
  { href: '/search', label: 'Search', icon: HiOutlineSearch },
  { href: '/bookmarks', label: 'Bookmarks', icon: HiOutlineBookmark },
  { href: '/history', label: 'History', icon: HiOutlineClock },
  { href: '/leaderboard', label: 'Leaderboard', icon: HiOutlineChartBar },
  { href: '/redeem', label: 'Redeem Code', icon: HiOutlineGift },
];

const browseItems = [
  { href: '/browse/populer', label: 'Populer', icon: HiOutlineFire },
  { href: '/browse/ongoing', label: 'Ongoing', icon: HiOutlinePlay },
  { href: '/browse/completed', label: 'Completed', icon: HiOutlineCheckCircle },
  { href: '/az-list', label: 'A-Z List', icon: HiOutlineGlobe },
];

const genreLinks = [
  { label: 'Action', href: '/search?q=action' },
  { label: 'Fantasy', href: '/search?q=fantasy' },
  { label: 'Adventure', href: '/search?q=adventure' },
  { label: 'Martial Arts', href: '/search?q=martial+arts' },
  { label: 'Comedy', href: '/search?q=comedy' },
  { label: 'Drama', href: '/search?q=drama' },
];

interface SidebarProps {
  popularList?: any[];
}

export default function Sidebar({ popularList: popularProp }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [popularList, setPopularList] = useState<any[]>(popularProp || []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}

    if ((!popularProp || popularProp.length === 0) && popularList.length === 0) {
      fetch(`${API_BASE}/api/anime/home`)
        .then(r => r.json())
        .then(d => {
          if (d.success) setPopularList((d.data.popular || []).slice(0, 10));
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (popularProp && popularProp.length > 0) {
      setPopularList(popularProp);
    }
  }, [popularProp]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 glass rounded-xl lg:hidden"
      >
        {isOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
      </button>

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

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-dark-900/95 backdrop-blur-xl z-50 transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Animated right border */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[1px] z-10"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(167,139,250,0.3), rgba(236,72,153,0.3), transparent)',
            backgroundSize: '100% 200%',
            animation: 'gradient-shift 4s ease infinite',
          }}
        />

        <div className="flex flex-col min-h-full relative">
          <Link href="/home" className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
            {/* Logo with glow */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-sm opacity-60" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FaFire className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{
                background: 'linear-gradient(135deg, #a78bfa, #ec4899, #a78bfa)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 3s ease infinite',
              }}>Z.XTREAM</h1>
              <p className="text-xs text-dark-400">Watch Anime Free</p>
            </div>
          </Link>

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
                      ? 'bg-purple-600/15 text-purple-400 border border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.08)]'
                      : 'text-dark-300 hover:bg-white/5 hover:text-white hover:scale-[1.02]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                  )}
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-dark-700/50">
              <p className="px-4 py-1 text-xs font-semibold text-dark-500 uppercase tracking-wider">Browse</p>
              {browseItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-400 border border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.08)]'
                      : 'text-dark-300 hover:bg-white/5 hover:text-white hover:scale-[1.02]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                  )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 mt-3 border-t border-dark-700/50">
              <p className="px-4 py-1 text-xs font-semibold text-dark-500 uppercase tracking-wider">Genre</p>
              <div className="flex flex-wrap gap-1.5 px-4 pt-2">
                {genreLinks.map((g) => (
                  <Link
                    key={g.label}
                    href={g.href}
                    onClick={() => setIsOpen(false)}
                    className="px-2.5 py-1 text-xs bg-white/5 text-dark-300 rounded-lg hover:bg-purple-600/15 hover:text-purple-400 hover:border-purple-500/25 transition-all duration-200"
                  >
                    {g.label}
                  </Link>
                ))}
              </div>
            </div>

            {popularList.length > 0 && (
              <div className="pt-3 mt-3 border-t border-white/5">
                <p className="px-4 py-1 text-xs font-semibold text-dark-500 uppercase tracking-wider">Populer</p>
                <div className="space-y-1 px-3 pt-2">
                  {popularList.map((anime: any, idx: number) => (
                    <Link
                      key={anime.slug}
                      href={`/anime/${anime.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
                    >
                      <span className={`w-5 h-5 flex items-center justify-center rounded-md text-xs font-bold flex-shrink-0 ${
                        idx < 3 ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-dark-700 text-dark-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="w-8 h-11 rounded-md overflow-hidden bg-white/5 flex-shrink-0 ring-1 ring-white/5">
                        <img src={anime.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <p className="text-xs font-medium text-dark-200 line-clamp-2 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                        {anime.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="px-3 py-4 border-t border-white/5">
            {user ? (
              <div className="space-y-2">
                <Link
                  href={`/profile/${user.uid}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  <AvatarFrame
                    src={user.photoURL}
                    role={user.role || 'member'}
                    size="md"
                    showStatus
                    isOnline
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
                  className="flex items-center gap-3 px-4 py-2 rounded-xl text-dark-300 hover:bg-white/5 hover:text-white transition-all duration-200"
                >
                  <HiOutlineCog className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </Link>

                {(user.isAdmin || user.role === 'owner' || user.isOwner || user.role === 'dev' || user.isDev) && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl text-dark-300 hover:bg-white/5 hover:text-purple-400 transition-all duration-200"
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
