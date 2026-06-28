'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiOutlinePlay, HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineClock, HiOutlineBookmark, HiOutlineShare,
} from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import VideoPlayer from '@/components/player/VideoPlayer';
import Comments from '@/components/anime/Comments';
import { API_BASE } from '@/lib/config';

interface Server {
  name: string;
  url: string;
  speed?: number;
}

interface Episode {
  title: string;
  number: number;
  url: string;
  date: string;
}

interface StreamData {
  videoUrl: string;
  servers: Server[];
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;
  const [stream, setStream] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [animeTitle, setAnimeTitle] = useState('');
  const [animeSlug, setAnimeSlug] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.role) setUserRole(user.role);
  }, []);

  useEffect(() => {
    fetchStreamData();
  }, [episodeId]);

  useEffect(() => {
    if (animeSlug) fetchEpisodes();
  }, [animeSlug]);

  const fetchStreamData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/anime/episode/stream?url=${encodeURIComponent(episodeId)}`);
      const data = await res.json();
      if (data.success) {
        setStream(data.data);
        // Try to extract anime slug from episode URL
        extractAnimeSlug();
      }
    } catch (error) {
      console.error('Failed to fetch stream:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractAnimeSlug = () => {
    // Extract slug from episodeId pattern: anime-slug-episode-X-subtitle-indonesia
    const match = episodeId.match(/^(.+?)-episode-\d+/i);
    if (match) {
      setAnimeSlug(match[1]);
    }
  };

  const fetchEpisodes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/anime/detail/${animeSlug}`);
      const data = await res.json();
      if (data.success && data.data) {
        setEpisodes(data.data.episodes || []);
        setAnimeTitle(data.data.title || '');
      }
    } catch {}
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    } catch {}
  };

  const toggleBookmark = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) { router.push('/login'); return; }
    try {
      await fetch(`${API_BASE}/api/users/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, slug: animeSlug }),
      });
      setIsBookmarked(!isBookmarked);
    } catch {}
  };

  const currentIdx = episodes.findIndex(ep =>
    ep.url.includes(episodeId) || episodeId.includes(`episode-${ep.number}`)
  );

  const epNum = episodeId.match(/episode-(\d+)/i)?.[1] || '0';
  const displayTitle = episodeId
    .replace(/-/g, ' ')
    .replace(/subtitle indonesia/gi, '')
    .replace(/episode \d+/gi, '')
    .trim();

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        {/* Player */}
        <VideoPlayer
          servers={stream?.servers || []}
          episodeId={episodeId}
          animeSlug={animeSlug}
          episodes={episodes}
          userRole={userRole}
        />

        {/* Info Bar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-white">
              {displayTitle} - Episode {epNum}
            </h1>
            {animeTitle && (
              <Link href={`/anime/${animeSlug}`} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                {animeTitle}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleBookmark}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isBookmarked ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
              }`}>
              <HiOutlineBookmark className="w-4 h-4" />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/10 transition-all">
              <HiOutlineShare className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Episode List */}
        {episodes.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Episode List ({episodes.length})</h2>
              {currentIdx >= 0 && (
                <span className="text-sm text-gray-400">
                  Watching EP {currentIdx + 1}
                </span>
              )}
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto scrollbar-hide">
              {episodes.map((ep, i) => {
                const slug = ep.url.split('/').filter(Boolean).pop() || '';
                const isActive = slug === episodeId || episodeId.includes(`episode-${ep.number}`);
                return (
                  <Link
                    key={i}
                    href={`/watch/${slug}`}
                    className={`px-2 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : i < currentIdx
                        ? 'bg-white/5 text-gray-500 hover:bg-white/10'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {ep.number || i + 1}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Comments */}
        <Comments type="episode" targetId={episodeId} />
      </div>
    </MainLayout>
  );
}
