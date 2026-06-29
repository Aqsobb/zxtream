'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineExternalLink } from 'react-icons/hi';
import { API_BASE } from '@/lib/config';

interface HeroSlide {
  title: string;
  slug: string;
  thumbnail: string;
  synopsis?: string;
}

export default function HeroSlidesTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlide, setNewSlide] = useState<{ title?: string; slug: string; thumbnail: string; synopsis: string }>({ slug: '', thumbnail: '', synopsis: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/config/hero-slides`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setSlides(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const searchAnime = async (q: string) => {
    if (!q.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/anime/suggest?q=${encodeURIComponent(q)}`);
      const d = await res.json();
      if (d.success) setSearchResults(d.data || []);
    } catch {}
  };

  const selectAnime = (anime: any) => {
    setNewSlide({
      title: anime.title,
      slug: anime.slug,
      thumbnail: anime.thumbnail,
      synopsis: '',
    });
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const addSlide = () => {
    if (!newSlide.slug || !newSlide.thumbnail) return;
    setSlides(prev => [...prev, { title: newSlide.title || newSlide.slug, slug: newSlide.slug, thumbnail: newSlide.thumbnail, synopsis: newSlide.synopsis }]);
    setNewSlide({ slug: '', thumbnail: '', synopsis: '' });
  };

  const removeSlide = (idx: number) => {
    setSlides(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSlide = (idx: number, field: string, value: string) => {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const saveSlides = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/config/hero-slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-2">Hero Slider</h2>
      <p className="text-sm text-gray-400 mb-4">
        Atur slide yang muncul di hero banner homepage. Maximal 5 slide.
      </p>

      {/* Current slides */}
      <div className="space-y-3 mb-6">
        {slides.map((slide, idx) => (
          <div key={idx} className="flex items-center gap-4 p-3 bg-dark-800/50 rounded-xl border border-white/5">
            <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-purple-400 flex-shrink-0">
              {idx + 1}
            </div>
            <div className="w-20 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
              <img src={slide.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{slide.title}</p>
              <input
                value={slide.synopsis || ''}
                onChange={(e) => updateSlide(idx, 'synopsis', e.target.value)}
                placeholder="Synopsis (optional)"
                className="mt-1 w-full text-xs bg-dark-700/50 border border-white/5 rounded-lg px-2 py-1.5 text-gray-300 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <button onClick={() => removeSlide(idx)}
              className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        ))}

        {slides.length === 0 && (
          <p className="text-sm text-dark-400 text-center py-4">Belum ada slide. Tambahkan di bawah.</p>
        )}
      </div>

      {/* Add new slide */}
      <div className="border-t border-white/5 pt-4">
        <h3 className="font-medium text-sm mb-3">Tambah Slide Baru</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-dark-400 mb-1 block">Anime Slug / URL</label>
            <div className="flex gap-2">
              <input
                value={newSlide.slug}
                onChange={(e) => setNewSlide(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="contoh: sword-art-online"
                className="flex-1 text-sm bg-dark-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50"
              />
              <button onClick={() => { setShowSearch(!showSearch); }}
                className="px-3 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-dark-600 transition-all">
                Cari
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-dark-400 mb-1 block">Thumbnail URL</label>
            <input
              value={newSlide.thumbnail}
              onChange={(e) => setNewSlide(prev => ({ ...prev, thumbnail: e.target.value }))}
              placeholder="https://..."
              className="w-full text-sm bg-dark-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <button onClick={addSlide} disabled={!newSlide.slug || !newSlide.thumbnail}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all flex-shrink-0 flex items-center gap-2">
            <HiOutlinePlus className="w-4 h-4" />
            Tambah
          </button>
        </div>

        {/* Search results */}
        {showSearch && (
          <div className="mt-3 p-3 bg-dark-800 rounded-xl border border-white/10">
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); searchAnime(e.target.value); }}
              placeholder="Cari anime..."
              className="w-full text-sm bg-dark-700/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50 mb-2"
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {searchResults.map((a: any) => (
                  <button key={a.slug} onClick={() => selectAnime(a)}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-dark-700 transition-all text-left">
                    <img src={a.thumbnail} alt="" className="w-10 h-14 rounded object-cover" />
                    <span className="text-sm text-gray-300 truncate">{a.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="mt-4 flex justify-end">
        <button onClick={saveSlides} disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all">
          {saving ? 'Menyimpan...' : 'Simpan Semua'}
        </button>
      </div>
    </motion.div>
  );
}
