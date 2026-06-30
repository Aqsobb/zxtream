'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlay, HiOutlineX, HiOutlineLightBulb,
  HiOutlineArrowsExpand, HiOutlineClock, HiOutlineChevronDown,
  HiOutlineChevronLeft, HiOutlineChevronRight,
} from 'react-icons/hi';
import { API_BASE } from '@/lib/config';
import Hls from 'hls.js';
import toast from 'react-hot-toast';

interface Server {
  name: string;
  url: string;
  speed?: number;
  directUrl?: string;
  directType?: string;
  premium?: boolean;
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
  userRole?: string;
  onServerChange?: (index: number) => void;
}

export default function VideoPlayer({ servers, episodeId, animeSlug, episodes, userRole, onServerChange }: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [testingServers, setTestingServers] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [useHLS, setUseHLS] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout>();
  const saveTimerRef = useRef<NodeJS.Timeout>();

  const isPremiumUser = ['owner', 'dev', 'vvip', 'vip'].includes(userRole || '');
  const currentServer = servers[selectedServer];
  const hasDirectUrl = !!currentServer?.directUrl && currentServer?.directType === 'hls';
  const shouldUseHLS = hasDirectUrl && useHLS;

  useEffect(() => {
    if (servers.length <= 1) return;
    autoSelectFastest();
  }, [servers]);

  useEffect(() => {
    checkResume();
  }, [episodeId]);

  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(saveTimerRef.current);
  }, [episodeId]);

  useEffect(() => {
    if (shouldUseHLS && videoRef.current) {
      initHLS();
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [shouldUseHLS, selectedServer, episodeId]);

  const initHLS = async () => {
    if (!videoRef.current || !currentServer?.directUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.setRequestHeader('Referer', 'https://anichin.moe/');
        },
      });
      hlsRef.current = hls;
      hls.loadSource(currentServer.directUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {});
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = currentServer.directUrl;
      videoRef.current.play().catch(() => {});
    }
  };

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimerRef.current);
  }, []);

  useEffect(() => {
    const handler = () => {};
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || !shouldUseHLS) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
          resetControlsTimer();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          resetControlsTimer();
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
          resetControlsTimer();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          videoRef.current.muted = !videoRef.current.muted;
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shouldUseHLS]);

  const autoSelectFastest = async () => {
    setTestingServers(true);

    const directIdx = servers.findIndex(s => s.directUrl);
    if (directIdx >= 0) {
      setSelectedServer(directIdx);
      setAutoSelected(true);
      setUseHLS(servers[directIdx].directType === 'hls');
      onServerChange?.(directIdx);
      setTestingServers(false);
      return;
    }

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
      const currentTime = videoRef.current?.currentTime || 0;
      const duration = videoRef.current?.duration || 0;
      if (currentTime < 1) return;
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
          progress: currentTime,
          duration: duration,
        }),
      });
    } catch {}
  };

  const switchServer = (index: number) => {
    const server = servers[index];
    if (server.premium && !isPremiumUser) {
      toast.error('Server ini khusus premium! VIP/VVIP/Owner/Dev only.');
      return;
    }
    setSelectedServer(index);
    setShowServerDropdown(false);
    setUseHLS(server.directType === 'hls');
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

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  const currentIdx = getCurrentEpisodeIndex();

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden group"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
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
              <p className="text-sm text-gray-400 mb-4">Kamu pernah nonton ini. Lanjut?</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Mulai dari Awal
                </button>
                <button
                  onClick={() => {
                    setShowResumePrompt(false);
                    if (videoRef.current && resumeData.progress) {
                      videoRef.current.currentTime = resumeData.progress;
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative aspect-video">
        {shouldUseHLS ? (
          <video
            ref={videoRef}
            className="w-full h-full"
            controls={showControls}
            playsInline
            autoPlay
          />
        ) : currentServer?.url ? (
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
              <p className="text-gray-400">Tidak ada sumber video</p>
            </div>
          </div>
        )}

        {shouldUseHLS && (
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-10 pointer-events-none"
              >
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
                      Direct Stream — No Ads
                    </span>
                    {currentServer?.premium && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg border border-yellow-500/30">
                        4K Premium
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors text-white text-xs font-medium"
                        title="Playback Speed"
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-dark-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-30">
                          {speeds.map(s => (
                            <button
                              key={s}
                              onClick={() => changeSpeed(s)}
                              className={`block w-full px-4 py-2 text-sm text-left whitespace-nowrap transition-colors ${
                                playbackSpeed === s
                                  ? 'bg-purple-600/20 text-purple-400'
                                  : 'text-gray-300 hover:bg-white/5'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={toggleFullscreen}
                      className="p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors text-white"
                      title="Fullscreen">
                      <HiOutlineArrowsExpand className="w-5 h-5" />
                    </button>
                  </div>
                </div>

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
        )}

        {!shouldUseHLS && (
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none"
              >
                <div className="flex items-center justify-between pointer-events-auto">
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
        )}
      </div>

      <div className="p-3 bg-dark-800 border-t border-white/5 relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowServerDropdown(!showServerDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:bg-white/10 transition-all"
          >
            <span className="text-gray-400">Server:</span>
            <span className="font-medium">{currentServer?.name || 'Unknown'}</span>
            {currentServer?.directUrl && (
              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded">DIRECT</span>
            )}
            {currentServer?.premium && (
              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded">4K</span>
            )}
            <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${showServerDropdown ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={autoSelectFastest}
            disabled={testingServers}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
          >
            <HiOutlineLightBulb className="w-3 h-3" />
            {testingServers ? 'Testing...' : 'Auto'}
          </button>
        </div>

        <AnimatePresence>
          {showServerDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-3 right-3 mb-2 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
            >
              <div className="max-h-64 overflow-y-auto p-2">
                {servers.map((server, index) => {
                  const locked = server.premium && !isPremiumUser;
                  return (
                    <button
                      key={index}
                      onClick={() => switchServer(index)}
                      disabled={locked}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all ${
                        selectedServer === index
                          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                          : locked
                          ? 'text-gray-600 cursor-not-allowed opacity-40'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{server.name}</span>
                        {server.directUrl && (
                          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded">DIRECT</span>
                        )}
                        {server.premium && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded">4K</span>
                        )}
                        {locked && (
                          <span className="text-[10px] text-gray-600">🔒 Premium Only</span>
                        )}
                      </div>
                      {server.speed !== undefined && (
                        <span className="text-xs opacity-60">{server.speed}ms</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
