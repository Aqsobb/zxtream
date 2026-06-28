'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlay, HiOutlinePause, HiOutlineCog, HiOutlineX,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineLightBulb,
  HiOutlineVolumeUp, HiOutlineVolumeOff, HiOutlineArrowSmRight,
  HiOutlineArrowsExpand, HiOutlineClock,
} from 'react-icons/hi';
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

interface VideoPlayerProps {
  servers: Server[];
  episodeId: string;
  animeSlug?: string;
  episodes?: Episode[];
  onServerChange?: (index: number) => void;
}

export default function VideoPlayer({ servers, episodeId, animeSlug, episodes, onServerChange }: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [testingServers, setTestingServers] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);
  const [showSkipOP, setShowSkipOP] = useState(false);
  const [showSkipED, setShowSkipED] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout>();
  const saveTimerRef = useRef<NodeJS.Timeout>();

  // Auto-select fastest server
  useEffect(() => {
    if (servers.length <= 1) return;
    autoSelectFastest();
  }, [servers]);

  // Resume playback check
  useEffect(() => {
    checkResume();
  }, [episodeId]);

  // Save progress periodically
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      saveProgress();
    }, 30000); // every 30 seconds
    return () => clearInterval(saveTimerRef.current);
  }, [episodeId]);

  // Simulate OP/ED timing (typically OP at start, ED at end)
  useEffect(() => {
    const timer = setTimeout(() => setShowSkipOP(true), 5000);
    const edTimer = setTimeout(() => setShowSkipED(true), 900000); // 15 min
    return () => { clearTimeout(timer); clearTimeout(edTimer); };
  }, [episodeId]);

  // Hide controls on idle
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimerRef.current);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const autoSelectFastest = async () => {
    setTestingServers(true);
    const results = await Promise.allSettled(
      servers.map(async (server, index) => {
        const start = Date.now();
        try {
          await fetch(server.url, { method: 'HEAD', mode: 'no-cors' });
          return { index, speed: Date.now() - start };
        } catch {
          return { index, speed: 9999 };
        }
      })
    );

    const speeds = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value)
      .sort((a, b) => a.speed - b.speed);

    if (speeds.length > 0) {
      setSelectedServer(speeds[0].index);
      setAutoSelected(true);
      onServerChange?.(speeds[0].index);
    }
    setTestingServers(false);
  };

  const checkResume = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user) return;
      const res = await fetch(`${API_BASE}/api/users/progress?userId=${user.uid}&episodeId=${episodeId}`);
      const data = await res.json();
      if (data.success && data.data && data.data.progress > 0) {
        setResumeData(data.data);
        setShowResumePrompt(true);
      }
    } catch {}
  };

  const saveProgress = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user) return;
      const epNum = episodeId.match(/episode-(\d+)/i)?.[1] || '0';
      await fetch(`${API_BASE}/api/users/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          animeId: animeSlug || episodeId,
          animeSlug: animeSlug || episodeId,
          episodeId,
          episodeNumber: parseInt(epNum) || 0,
          title: episodeId.replace(/-/g, ' ').replace(/subtitle indonesia/gi, '').trim(),
          progress: 1,
          duration: 1,
        }),
      });
    } catch {}
  };

  const switchServer = (index: number) => {
    setSelectedServer(index);
    setShowSettings(false);
    onServerChange?.(index);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPipActive(false);
      } else if (iframeRef.current) {
        // PiP for iframe is limited, try on container
        const video = document.querySelector('video');
        if (video) {
          await video.requestPictureInPicture();
          setPipActive(true);
        }
      }
    } catch {}
  };

  const getCurrentEpisodeIndex = () => {
    if (!episodes) return -1;
    return episodes.findIndex(ep => ep.url.includes(episodeId) || episodeId.includes(`episode-${ep.number}`));
  };

  const goToEpisode = (direction: 'prev' | 'next') => {
    if (!episodes) return;
    const idx = getCurrentEpisodeIndex();
    if (idx === -1) return;
    const target = direction === 'prev' ? episodes[idx - 1] : episodes[idx + 1];
    if (target) {
      const slug = target.url.split('/').filter(Boolean).pop() || '';
      window.location.href = `/watch/${slug}`;
    }
  };

  const currentServer = servers[selectedServer];
  const currentIdx = getCurrentEpisodeIndex();

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden group"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Resume prompt */}
      <AnimatePresence>
        {showResumePrompt && resumeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center"
          >
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-sm text-center">
              <HiOutlineClock className="w-12 h-12 mx-auto text-purple-400 mb-3" />
              <h3 className="text-lg font-bold mb-2">Resume Playback?</h3>
              <p className="text-sm text-gray-400 mb-4">You watched this before. Continue where you left off?</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-colors"
                >
                  Resume
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video iframe */}
      <div className="relative aspect-video">
        {currentServer?.url ? (
          <iframe
            ref={iframeRef}
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

        {/* Skip OP Button */}
        <AnimatePresence>
          {showSkipOP && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => setShowSkipOP(false)}
              className="absolute bottom-20 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-medium text-white hover:bg-white/30 transition-all z-20"
            >
              Skip Opening ▸▸
            </motion.button>
          )}
        </AnimatePresence>

        {/* Skip ED Button */}
        <AnimatePresence>
          {showSkipED && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => {
                setShowSkipED(false);
                goToEpisode('next');
              }}
              className="absolute bottom-20 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-medium text-white hover:bg-white/30 transition-all z-20"
            >
              Skip Ending ▸▸
            </motion.button>
          )}
        </AnimatePresence>

        {/* Controls overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-10 pointer-events-none"
            >
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  {autoSelected && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
                      Auto: {currentServer?.name}
                    </span>
                  )}
                  {testingServers && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg border border-yellow-500/30 animate-pulse">
                      Testing servers...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={togglePiP}
                    className="p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors text-white"
                    title="Picture in Picture">
                    <HiOutlineArrowsExpand className="w-5 h-5" />
                  </button>
                  <button onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors text-white"
                    title="Fullscreen">
                    {isFullscreen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineArrowsExpand className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Bottom bar - prev/next */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
                <button
                  onClick={() => goToEpisode('prev')}
                  disabled={!episodes || currentIdx <= 0}
                  className="flex items-center gap-1 px-3 py-2 bg-black/40 hover:bg-black/60 rounded-xl text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <HiOutlineChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-xs text-white/60">
                  {currentIdx >= 0 ? `EP ${currentIdx + 1}/${episodes?.length}` : ''}
                </span>
                <button
                  onClick={() => goToEpisode('next')}
                  disabled={!episodes || currentIdx >= (episodes?.length || 0) - 1}
                  className="flex items-center gap-1 px-3 py-2 bg-black/40 hover:bg-black/60 rounded-xl text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <HiOutlineChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Server Selection Bar */}
      <div className="p-3 bg-dark-800 border-t border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {servers.map((server, index) => (
            <button
              key={index}
              onClick={() => switchServer(index)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedServer === index
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {server.name}
              {server.speed !== undefined && (
                <span className="text-[10px] opacity-60">{server.speed}ms</span>
              )}
            </button>
          ))}
          <button
            onClick={autoSelectFastest}
            disabled={testingServers}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
          >
            <HiOutlineLightBulb className="w-3 h-3" />
            {testingServers ? 'Testing...' : 'Auto'}
          </button>
        </div>
      </div>
    </div>
  );
}
