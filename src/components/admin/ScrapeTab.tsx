'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineRefresh, HiOutlineCheck, HiOutlineExclamation, HiOutlineGlobe } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { API_BASE } from '@/lib/config';

interface ScrapeLog {
  type: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: number;
}

export default function ScrapeTab() {
  const [scraping, setScraping] = useState(false);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);

  const addLog = (type: string, status: ScrapeLog['status'], message: string) => {
    setLogs(prev => [{ type, status, message, timestamp: Date.now() }, ...prev].slice(0, 50));
  };

  const scrapeAll = async () => {
    setScraping(true);
    setLogs([]);
    addLog('system', 'pending', 'Memulai scrape semua data...');

    // 1. Scrape home page
    addLog('home', 'pending', 'Scrape home page donghua...');
    try {
      const homeRes = await fetch(`${API_BASE}/api/anime/home?refresh=1`);
      const homeData = await homeRes.json();
      if (homeData.success) {
        addLog('home', 'success', `Home page scraped: ${homeData.data.popular?.length || 0} popular, ${homeData.data.ongoing?.length || 0} ongoing`);
      } else {
        addLog('home', 'error', 'Home page scrape failed');
      }
    } catch (e: any) {
      addLog('home', 'error', `Home error: ${e.message}`);
    }

    // 2. Scrape drama home
    addLog('drama', 'pending', 'Scrape drama dari Sansekai API...');
    try {
      const dramaRes = await fetch(`${API_BASE}/api/drama/home`);
      const dramaData = await dramaRes.json();
      if (dramaData.success) {
        addLog('drama', 'success', `Drama scraped: ${dramaData.data.dramas?.length || 0} dramas, ${dramaData.data.movies?.length || 0} movies`);
      } else {
        addLog('drama', 'error', 'Drama scrape failed');
      }
    } catch (e: any) {
      addLog('drama', 'error', `Drama error: ${e.message}`);
    }

    // 3. Scrape ongoing pages
    for (let page = 1; page <= 2; page++) {
      addLog('ongoing', 'pending', `Scrape ongoing page ${page}...`);
      try {
        const res = await fetch(`${API_BASE}/api/anime/ongoing?page=${page}&refresh=1`);
        const data = await res.json();
        if (data.success) {
          addLog('ongoing', 'success', `Ongoing page ${page}: ${data.data?.length || 0} items`);
        }
      } catch (e: any) {
        addLog('ongoing', 'error', `Ongoing page ${page} error: ${e.message}`);
      }
    }

    // 4. Scrape completed
    addLog('completed', 'pending', 'Scrape completed page 1...');
    try {
      const res = await fetch(`${API_BASE}/api/anime/completed?page=1&refresh=1`);
      const data = await res.json();
      if (data.success) {
        addLog('completed', 'success', `Completed: ${data.data?.items?.length || data.data?.length || 0} items`);
      }
    } catch (e: any) {
      addLog('completed', 'error', `Completed error: ${e.message}`);
    }

    addLog('system', 'success', 'Scrape all selesai!');
    setScraping(false);
    toast.success('Scrape all selesai!');
  };

  const scrapeAnichinOnly = async () => {
    setScraping(true);
    addLog('system', 'pending', 'Scrape ulang donghua...');
    try {
      const res = await fetch(`${API_BASE}/api/anime/home?refresh=1`);
      const data = await res.json();
      if (data.success) {
        addLog('anichin', 'success', `Anichin scraped: ${data.data.popular?.length || 0} items`);
        toast.success('Donghua updated!');
      }
    } catch (e: any) {
      addLog('anichin', 'error', `Error: ${e.message}`);
      toast.error('Gagal scrape donghua');
    }
    setScraping(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <HiOutlineGlobe className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold">Scrape Data</h2>
      </div>

      <div className="bg-dark-800/50 border border-white/5 rounded-2xl p-6">
        <p className="text-sm text-gray-400 mb-4">
          Scrape ulang semua data dari sumber (anichin.moe, anichin.best, sansekai.my.id).
          Data akan disimpan permanen di Firebase.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={scrapeAll}
            disabled={scraping}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${scraping ? 'animate-spin' : ''}`} />
            {scraping ? 'Scraping...' : 'Scrape All'}
          </button>
          <button
            onClick={scrapeAnichinOnly}
            disabled={scraping}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl font-semibold hover:bg-orange-500/30 transition-all disabled:opacity-50"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${scraping ? 'animate-spin' : ''}`} />
            Scrape Donghua Only
          </button>
        </div>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Log:</h3>
          <div className="max-h-80 overflow-y-auto space-y-1 bg-dark-900/50 rounded-xl p-3 border border-white/5">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-gray-600 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {log.status === 'success' ? (
                  <HiOutlineCheck className="w-3 h-3 text-green-400 shrink-0" />
                ) : log.status === 'error' ? (
                  <HiOutlineExclamation className="w-3 h-3 text-red-400 shrink-0" />
                ) : (
                  <HiOutlineRefresh className="w-3 h-3 text-yellow-400 animate-spin shrink-0" />
                )}
                <span className={`${
                  log.status === 'success' ? 'text-green-300' :
                  log.status === 'error' ? 'text-red-300' :
                  'text-yellow-300'
                }`}>
                  [{log.type.toUpperCase()}]
                </span>
                <span className="text-gray-400">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
