'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBell, HiOutlineCheck } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import { API_BASE } from '@/lib/config';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  from: string;
  read: boolean;
  createdAt: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const url = user ? `${API_BASE}/api/users/notifications?userId=${user.uid}` : `${API_BASE}/api/users/notifications`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Also clear badge in localStorage
    localStorage.setItem('notifications_read', Date.now().toString());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto mark as read when page opens
  useEffect(() => {
    if (!loading && notifications.length > 0 && unreadCount > 0) {
      const timer = setTimeout(() => markAllRead(), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, notifications]);

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    return `${days}d lalu`;
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <HiOutlineBell className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {unreadCount} baru
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <HiOutlineCheck className="w-4 h-4" />
              Tandai semua dibaca
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineBell className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Belum ada notifikasi</h2>
            <p className="text-gray-400">Notifikasi akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all ${
                  notif.read
                    ? 'bg-white/5 border-white/5'
                    : 'bg-purple-500/5 border-purple-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{notif.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
