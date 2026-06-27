'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineGift, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import { API_BASE } from '@/lib/config';

export default function RedeemPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      setResult({ success: false, message: 'Login first!' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          uid: user.uid,
          displayName: user.displayName,
        }),
      });
      const data = await res.json();
      setResult(data);

      if (data.success) {
        const updatedUser = { ...user, role: data.type === 'owner' ? 'owner' : data.type === 'vvip' ? 'vvip' : user.role };
        if (data.type === 'owner') updatedUser.isOwner = true;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCode('');
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <HiOutlineGift className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Redeem Code</h1>
            <p className="text-gray-400 mt-2">Enter your code to get premium, VIP, or rewards</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <label className="text-sm text-gray-400 mb-2 block">Redemption Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              maxLength={20}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg font-mono tracking-widest placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            />

            <button
              onClick={handleRedeem}
              disabled={!code.trim() || loading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
            >
              {loading ? 'Redeeming...' : 'Redeem'}
            </button>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
                  result.success
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {result.success ? <HiOutlineCheck className="w-5 h-5 flex-shrink-0" /> : <HiOutlineX className="w-5 h-5 flex-shrink-0" />}
                {result.message}
              </motion.div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Code types: Owner, VVIP, VIP, Premium, EXP, Coins</p>
            <p className="mt-1">Each code can only be used once</p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
