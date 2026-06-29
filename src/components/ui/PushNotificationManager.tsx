'use client';

import { useState, useEffect } from 'react';
import { HiOutlineBell } from 'react-icons/hi';
import { API_BASE } from '@/lib/config';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true);
      const stored = localStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        checkSubscription(userData.uid);
      }
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const checkSubscription = async (uid: string) => {
    try {
      const reg = await navigator.serviceWorker?.ready;
      const subscription = await reg?.pushManager?.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {}
  };

  const handleSubscribe = async () => {
    if (!user) {
      alert('Login dulu untuk aktifkan notifikasi!');
      return;
    }

    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Izin notifikasi ditolak!');
        setLoading(false);
        return;
      }

      // Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY) : undefined,
      });

      // Save to server
      await fetch(`${API_BASE}/api/users/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          subscription: subscription.toJSON(),
        }),
      });

      setIsSubscribed(true);
      alert('Notifikasi aktif! Kamu akan dapat notif kalau ada episode baru.');
    } catch (err) {
      console.error('Subscribe error:', err);
      alert('Gagal aktifkan notifikasi. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch(`${API_BASE}/api/users/push?userId=${user.uid}`, {
        method: 'DELETE',
      });

      setIsSubscribed(false);
      alert('Notifikasi dimatikan.');
    } catch (err) {
      console.error('Unsubscribe error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <HiOutlineBell className="w-6 h-6 text-green-400" />
          ) : (
            <HiOutlineBell className="w-6 h-6 text-gray-500" />
          )}
          <div>
            <h3 className="font-bold">Episode Update Notifikasi</h3>
            <p className="text-sm text-gray-400">
              {isSubscribed
                ? 'Aktif — Kamu akan dapat notif kalau ada episode baru!'
                : 'Nonaktif — Aktifkan untuk dapat notif episode baru'}
            </p>
          </div>
        </div>
        <button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
            isSubscribed
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
          }`}
        >
          {loading ? 'Loading...' : isSubscribed ? 'Matikan' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
}
