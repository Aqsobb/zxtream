'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getRoleConfig, UserRole } from '@/lib/roles';
import AvatarFrame from '@/components/ui/AvatarFrame';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function RoleBadge({ role, size = 'md', showLabel = true, className = '' }: RoleBadgeProps) {
  const config = getRoleConfig(role);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${config.color}20, ${config.color}40)`,
        color: config.color,
        border: `1px solid ${config.color}50`,
        boxShadow: config.glow !== 'none' ? `0 0 8px ${config.color}30` : undefined,
      }}
    >
      <span>{config.badge}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

interface RoleNameProps {
  name: string;
  role: string;
  className?: string;
}

export function RoleName({ name, role, className = '' }: RoleNameProps) {
  const config = getRoleConfig(role);

  return (
    <span className={`relative inline-flex items-center gap-2 ${className}`}>
      {config.crown && <span className="text-lg">👑</span>}
      {config.diamond && <span className="text-lg">💎</span>}
      {config.star && <span className="text-lg">⭐</span>}
      <span style={{ color: config.color }} className="font-bold">{name}</span>
    </span>
  );
}

interface ProfileCardProps {
  user: {
    uid?: string;
    displayName: string;
    photoURL?: string;
    role?: string;
    level?: number;
    exp?: number;
    totalExp?: number;
    title?: string;
    badges?: string[];
    bio?: string;
    watchTime?: number;
    followers?: string[];
  };
  showBio?: boolean;
  className?: string;
}

export function ProfileCard({ user, showBio = true, className = '' }: ProfileCardProps) {
  const config = getRoleConfig(user.role || 'member');
  const role = user.role || 'member';
  const isDev = role === 'dev';
  const isOwner = role === 'owner';
  const isVVIP = role === 'vvip';
  const isVIP = role === 'vip';
  const isPremium = isDev || isOwner || isVVIP || isVIP;

  // Check if this is the current user's profile
  let isOwnProfile = false;
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const currentUser = JSON.parse(stored);
      isOwnProfile = currentUser?.uid === user.uid;
    }
  } catch {}

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${config.border} ${className}`}
      style={{
        boxShadow: config.glow !== 'none' ? config.glow : undefined,
      }}
    >
      {/* Banner background */}
      <div className="absolute inset-0" style={{ background: config.bannerGradient }} />

      {/* Animated border glow for dev/owner */}
      {(isDev || isOwner) && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: `2px solid transparent`,
            background: `linear-gradient(135deg, ${config.color}60, transparent 30%, transparent 70%, ${config.color}60) border-box`,
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Rotating ring for owner */}
      {isOwner && (
        <motion.div
          className="absolute -inset-[2px] rounded-2xl pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${config.color}50, transparent, ${config.color}50, transparent)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Diamond shimmer for VVIP */}
      {isVVIP && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${config.color}15 50%, transparent 70%)`,
            backgroundSize: '200% 200%',
          }}
          animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Star sparkle for VIP */}
      {isVIP && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: config.color,
                left: `${20 + i * 30}%`,
                top: `${20 + i * 15}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating particles for dev/owner */}
      {(isDev || isOwner) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: config.color,
                left: `${10 + Math.random() * 80}%`,
                bottom: '0%',
              }}
              animate={{
                y: [0, -120 - Math.random() * 80],
                x: [0, (Math.random() - 0.5) * 40],
                opacity: [0.7, 0],
                scale: [1, 0.3],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          {/* Avatar with frame */}
          <div className="relative">
            <AvatarFrame
              src={user.photoURL || ''}
              role={role}
              size="xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <RoleName name={user.displayName} role={role} className="text-xl" />
              {isOwnProfile && (
                <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-xs text-white/80 font-medium">
                  Kamu
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <RoleBadge role={role} size="sm" />
              <span className="text-sm text-gray-300">Level {user.level || 1}</span>
            </div>
            {user.title && (
              <p className="text-sm mt-1 italic" style={{ color: config.color }}>
                &quot;{user.title}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Bio + Status */}
        {showBio && user.bio && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-gray-200">{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function OwnerInfoSection() {
  return (
    <div
      className="rounded-2xl border border-yellow-500/20 p-6"
      style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #2d1b4e 30%, #4a1942 60%, #1a0533 100%)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">👑</span>
        <h3 className="text-xl font-extrabold text-yellow-400">Boss Besar Z.XTREAM</h3>
      </div>
      <div className="space-y-3 text-sm">
        <p className="text-yellow-100 text-base leading-relaxed">
          &quot;Mimpi nggak pernah minta izin ke dompet kamu. Mulai dari nol, jatuh bangun, gagal berkali-kali, tapi selalu bangkit lagi. Karena satu-satunya kegagalan yang nyata adalah saat kamu berhenti mencoba.&quot;
        </p>
        <p className="text-yellow-200/60 text-xs">
          Jadikan Z.XTREAM bukti bahwa anak kismin juga bisa bikin sesuatu yang besar. Teruslah berjuang, satu baris kode pada satu waktu. 🔥
        </p>
        <div className="flex items-center gap-4 pt-2">
          <span className="text-yellow-400 font-bold">⚡ The One and Only Boss</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-300">UID: 33333</span>
        </div>
      </div>
    </div>
  );
}

export function DevInfoSection() {
  return (
    <div
      className="rounded-2xl border border-cyan-500/20 p-6"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 30%, #24243e 60%, #0f0c29 100%)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">⚡</span>
        <h3 className="text-xl font-extrabold text-cyan-400">Developer Z.XTREAM</h3>
      </div>
      <div className="space-y-3 text-sm">
        <p className="text-cyan-100 text-base leading-relaxed">
          &quot;Setiap error yang kamu fix, setiap bug yang kamu debug, setiap feature yang kamu ship — itu semua langkah kecil menuju sesuatu yang luar biasa. Keep building, keep shipping.&quot;
        </p>
        <p className="text-cyan-200/60 text-xs">
          Dari yang nggak ngerti HTML sampai bisa build full-stack streaming platform. Coding is not about talent, it&apos;s about persistence. 🚀
        </p>
        <div className="flex items-center gap-4 pt-2">
          <span className="text-cyan-400 font-bold">⚡ The Creator</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-300">UID: 33333</span>
        </div>
      </div>
    </div>
  );
}

export function DonationSection() {
  const [donationSettings, setDonationSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || ''}/api/admin/theme`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setDonationSettings(d.data.donation || null);
      })
      .catch(() => {});
  }, []);

  if (!donationSettings?.enabled) return null;

  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">☕</span>
        Donasi & Support
      </h3>
      <p className="text-sm text-gray-300 mb-4">
        Kalau kalian mau support, boleh donasi seikhlasnya. Nggak wajib, tapi sangat membantu! 🙏
      </p>
      {donationSettings.qrUrl && (
        <div className="mb-4">
          <img src={donationSettings.qrUrl} alt="QR Code Donasi" className="w-48 h-48 mx-auto rounded-xl border border-white/10" />
          <p className="text-center text-xs text-gray-400 mt-2">Scan QR untuk donasi</p>
        </div>
      )}
      {donationSettings.danaNumber && (
        <div className="text-center mb-2">
          <span className="text-sm text-gray-300">Dana: </span>
          <span className="text-sm font-mono text-white">{donationSettings.danaNumber}</span>
        </div>
      )}
      {donationSettings.telegramLink && (
        <div className="text-center">
          <a href={donationSettings.telegramLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-sm text-blue-400 hover:bg-blue-500/30 transition-colors">
            <span>💬</span> Join Grup Telegram
          </a>
        </div>
      )}
    </div>
  );
}
