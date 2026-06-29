'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineShare, HiOutlineClock, HiOutlineStar } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import Comments from '@/components/anime/Comments';
import { API_BASE } from '@/lib/config';

interface AnimeDetail {
  title: string;
  slug: string;
  thumbnail: string;
  banner: string;
  synopsis: string;
  info: Record<string, string>;
  genres: string[];
  episodes: {
    title: string;
    number: number;
    url: string;
    date: string;
  }[];
  type: string;
  status: string;
  releaseYear: number;
  duration: string;
  rating: string;
  studio: string;
}

export default function AnimeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimeDetail();
  }, [slug]);

  const fetchAnimeDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/anime/detail/${slug}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAnime({
          ...data.data,
          genres: data.data.genres || [],
          episodes: data.data.episodes || [],
          info: data.data.info || {},
          synopsis: data.data.synopsis || '',
          releaseYear: data.data.releaseYear || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch anime detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6 space-y-4">
          <div className="h-64 lg:h-96 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-8 w-64 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  if (!anime) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6 text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Anime tidak ditemukan</h1>
          <p className="text-gray-400">Coba cari anime lain di search</p>
          <Link href="/search" className="inline-block mt-4 px-6 py-2 bg-purple-600 rounded-xl text-white font-medium hover:bg-purple-500 transition-colors">
            Search Anime
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Banner */}
        <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden mb-8">
          <img
            src={anime.banner || anime.thumbnail}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/50 to-transparent" />
        </div>

        <div className="-mt-32 relative z-10 px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Thumbnail */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0"
            >
              <img
                src={anime.thumbnail}
                alt={anime.title}
                className="w-44 lg:w-56 rounded-2xl shadow-2xl shadow-black/50 border border-white/10"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <h1 className="text-2xl lg:text-4xl font-extrabold mb-4">{anime.title}</h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {anime.type && (
                  <span className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-medium border border-purple-500/20">
                    {anime.type}
                  </span>
                )}
                {anime.status && (
                  <span className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm font-medium border border-white/10">
                    {anime.status}
                  </span>
                )}
                {anime.releaseYear > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <HiOutlineClock className="w-4 h-4" />
                    {anime.releaseYear}
                  </span>
                )}
                {anime.rating && (
                  <span className="flex items-center gap-1.5 text-sm text-yellow-400">
                    <HiOutlineStar className="w-4 h-4" />
                    {anime.rating}
                  </span>
                )}
              </div>

              {/* Genres */}
              {anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {anime.genres.map((genre) => (
                    <Link
                      key={genre}
                      href={`/genre/${encodeURIComponent(genre)}`}
                      className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 text-sm rounded-lg transition-colors border border-white/5 hover:border-purple-500/30"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {anime.synopsis && (
                <p className="text-gray-300 mb-6 leading-relaxed line-clamp-4 lg:line-clamp-none">
                  {anime.synopsis}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {anime.episodes.length > 0 && (
                  <Link
                    href={`/watch/${anime.episodes[0].url.split('/').filter(Boolean).pop()}`}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  >
                    <HiOutlinePlay className="w-5 h-5" />
                    Watch Now
                  </Link>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white/5 text-white rounded-2xl font-medium hover:bg-white/10 transition-all duration-200 border border-white/10"
                >
                  <HiOutlineShare className="w-5 h-5" />
                  Share
                </button>
              </div>
            </motion.div>
          </div>

          {/* Episodes */}
          {anime.episodes.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <h2 className="text-xl font-bold mb-5">Episodes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {anime.episodes.map((ep) => (
                  <Link
                    key={ep.number}
                    href={`/watch/${ep.url.split('/').filter(Boolean).pop()}`}
                    className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-purple-500/30"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{ep.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">{ep.title}</p>
                      {ep.date && (
                        <p className="text-xs text-gray-500">{ep.date}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* Comments */}
          <Comments type="anime" targetId={anime.slug} />
        </div>
      </div>
    </MainLayout>
  );
}
