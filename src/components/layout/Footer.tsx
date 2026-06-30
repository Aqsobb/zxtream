'use client';

import Link from 'next/link';
import { FaFire } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="lg:ml-64 border-t border-white/5 bg-dark-900/50 mt-8">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/home" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-pink rounded-lg flex items-center justify-center">
                <FaFire className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Z.XTREAM</span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed">
              Nonton donghua sub Indonesia gratis. Koleksi terlengkap dengan kualitas HD.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Browse</h3>
            <ul className="space-y-2">
              <li><Link href="/browse/populer" className="text-sm text-dark-400 hover:text-purple-400 transition-colors">Populer</Link></li>
              <li><Link href="/browse/ongoing" className="text-sm text-dark-400 hover:text-purple-400 transition-colors">Ongoing</Link></li>
              <li><Link href="/browse/completed" className="text-sm text-dark-400 hover:text-purple-400 transition-colors">Completed</Link></li>
              <li><Link href="/az-list" className="text-sm text-dark-400 hover:text-purple-400 transition-colors">A-Z List</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Account</h3>
            <ul className="space-y-2">
              <li><Link href="/bookmarks" className="text-sm text-dark-400 hover:text-purple-400 transition-colors">Bookmarks</Link></li>
              <li><Link href="/history" className="text-sm text-dark-400 hover:text-purple-400 transition-colors">History</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-dark-400 hover:text-purple-400 transition-colors">Leaderboard</Link></li>
              <li><Link href="/settings" className="text-sm text-dark-400 hover:text-purple-400 transition-colors">Settings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-dark-400">DMCA</span></li>
              <li><span className="text-sm text-dark-400">Privacy Policy</span></li>
              <li><span className="text-sm text-dark-400">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-dark-500">
            &copy; {new Date().getFullYear()} Z.XTREAM. All rights reserved.
          </p>
          <p className="text-xs text-dark-500">
            Built with passion for anime lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
