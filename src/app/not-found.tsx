'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHome, HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            404
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-400 mb-8">
          Sepertinya halaman yang kamu cari sudah dipindahkan atau tidak tersedia.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            <HiOutlineHome className="w-5 h-5" />
            Kembali ke Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
          >
            <HiOutlineSearch className="w-5 h-5" />
            Cari Anime
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
