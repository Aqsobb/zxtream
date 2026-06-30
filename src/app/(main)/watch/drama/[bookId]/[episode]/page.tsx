'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineRefresh } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import VideoPlayer from '@/components/player/VideoPlayer';
import Comments from '@/components/anime/Comments';
import { API_BASE } from '@/lib/config';

export default function DramaWatchPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const episodeNum = parseInt(params.episode as string) || 1;
  const [drama, setDrama] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user?.role) setUserRole(user.role);
    } catch {}
    fetchData();
  }, [bookId, episodeNum]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [detailRes, epsRes] = await Promise.all([
        fetch(`${API_BASE}/api/drama/detail/${bookId}`),
        fetch(`${API_BASE}/api/drama/episodes/${bookId}`),
      ]);
      const detail = await detailRes.json();
      const eps = await epsRes.json();
      if (detail.success) setDrama(detail.data);
      if (eps.success) setEpisodes(eps.data);
    } catch {} finally { setLoading(false); }
  };

  const currentEp = episodes.find((ep: any) => ep.number === episodeNum);
  const currentIdx = episodes.findIndex((ep: any) => ep.number === episodeNum);

  const servers = currentEp?.servers || (currentEp?.url ? [
    { name: 'Sansekai Stream', url: currentEp.url, directUrl: currentEp.url, directType: currentEp.url?.includes('.m3u8') ? 'hls' : 'mp4', premium: false },
  ] : []);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          <div className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        {servers.length > 0 ? (
          <VideoPlayer
            servers={servers}
            episodeId={`drama-${bookId}-ep-${episodeNum}`}
            animeSlug={bookId}
            episodes={episodes.map((ep: any) => ({
              title: ep.title || `Episode ${ep.number}`,
              number: ep.number,
              url: `/watch/drama/${bookId}/${ep.number}`,
              date: ep.date || '',
            }))}
            userRole={userRole}
          />
        ) : (
          <div className="aspect-video rounded-2xl bg-white/5 flex items-center justify-center">
            <div className="text-center">
              <HiOutlinePlay className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Stream tidak tersedia</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-white">
              {drama?.title || 'Drama'} - Episode {episodeNum}
            </h1>
            {drama?.title && (
              <Link href={`/drama/${bookId}`} className="text-sm text-green-400 hover:text-green-300 transition-colors">
                {drama.title}
              </Link>
            )}
          </div>
          {currentIdx >= 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/watch/drama/${bookId}/${episodeNum - 1}`)}
                disabled={episodeNum <= 1}
                className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="text-sm text-gray-500">EP {episodeNum}/{episodes.length}</span>
              <button
                onClick={() => router.push(`/watch/drama/${bookId}/${episodeNum + 1}`)}
                disabled={episodeNum >= episodes.length}
                className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {episodes.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold mb-3">Episode List ({episodes.length})</h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto scrollbar-hide">
              {episodes.map((ep: any, i: number) => (
                <Link
                  key={i}
                  href={`/watch/drama/${bookId}/${ep.number}`}
                  className={`px-2 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                    ep.number === episodeNum
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                      : ep.number < episodeNum
                      ? 'bg-white/5 text-gray-500 hover:bg-white/10'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {ep.number}
                </Link>
              ))}
            </div>
          </div>
        )}

        <Comments type="drama" targetId={`${bookId}-ep-${episodeNum}`} />
      </div>
    </MainLayout>
  );
}
