'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiOutlinePlay,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import Comments from '@/components/anime/Comments';
import { API_BASE } from '@/lib/config';

interface Server {
  name: string;
  url: string;
}

interface StreamData {
  videoUrl: string;
  servers: Server[];
}

export default function WatchPage() {
  const params = useParams();
  const episodeId = params.id as string;
  const [stream, setStream] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState(0);
  const [showServers, setShowServers] = useState(false);

  useEffect(() => {
    fetchStreamData();
  }, [episodeId]);

  useEffect(() => {
    if (!stream || !episodeId) return;
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;

    const epNum = episodeId.match(/episode-(\d+)/i)?.[1] || '0';
    fetch(`${API_BASE}/api/users/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        animeId: episodeId,
        animeSlug: episodeId,
        episodeId,
        episodeNumber: parseInt(epNum) || 0,
        title: episodeId.replace(/-/g, ' ').replace(/subtitle indonesia/gi, '').trim(),
        thumbnail: '',
        progress: 1,
        duration: 1,
      }),
    }).catch(() => {});
  }, [stream, episodeId]);

  const fetchStreamData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/anime/episode/stream?url=${encodeURIComponent(episodeId)}`);
      const data = await res.json();
      if (data.success) {
        setStream(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stream:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentServer = stream?.servers?.[selectedServer];

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6">
          <div className="skeleton aspect-video rounded-2xl" />
          <div className="skeleton h-8 w-64 mt-4" />
          <div className="skeleton h-4 w-full mt-2" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          {currentServer?.url ? (
            <iframe
              key={`${episodeId}-${selectedServer}`}
              src={currentServer.url}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <HiOutlinePlay className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No video source available</p>
              </div>
            </div>
          )}
        </div>

        {/* Server Selection */}
        {stream?.servers && stream.servers.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowServers(!showServers)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all duration-200 w-full justify-between"
            >
              <span className="text-gray-300">
                Server: <span className="text-white font-semibold">{currentServer?.name || 'Unknown'}</span>
              </span>
              <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${showServers ? 'rotate-180' : ''}`} />
            </button>

            {showServers && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
              >
                {stream.servers.map((server, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedServer(index);
                      setShowServers(false);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedServer === index
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                    }`}
                  >
                    {server.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Episode Info */}
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <h1 className="text-lg font-bold text-white">{episodeId.replace(/-/g, ' ').replace(/subtitle indonesia/gi, '').trim()}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Playing via <span className="text-purple-400">{currentServer?.name}</span>
          </p>
        </div>

        {/* Comments */}
        <Comments type="episode" targetId={episodeId} />
      </div>
    </MainLayout>
  );
}
