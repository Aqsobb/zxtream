'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoleConfig, UserRole } from '@/lib/roles';

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
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
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
    </motion.span>
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
      {config.crown && (
        <span className="text-lg">👑</span>
      )}
      {config.diamond && (
        <span className="text-lg">💎</span>
      )}
      <span
        className="font-bold"
        style={{
          color: config.color,
        }}
      >
        {name}
      </span>
    </span>
  );
}

function RoleParticles({ color }: { color: string }) {
  return (
    <span className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ background: color }}
          animate={{
            x: [0, Math.random() * 40 - 20],
            y: [0, Math.random() * -30 - 10],
            opacity: [0.8, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
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
  className?: string;
}

export function ProfileCard({ user, className = '' }: ProfileCardProps) {
  const config = getRoleConfig(user.role || 'member');
  const role = user.role || 'member';
  const isPremium = role === 'owner' || role === 'vvip' || role === 'vip';
  const isDev = role === 'dev';
  const isOwner = role === 'owner';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${config.border} ${className}`}
      style={{
        boxShadow: config.glow !== 'none' ? `0 0 20px ${config.color}25` : undefined,
      }}
    >
      {/* Banner background */}
      <div className="absolute inset-0" style={{ background: config.bannerGradient }} />

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={user.photoURL || '/images/default-avatar.png'}
              alt={user.displayName}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{
                border: `3px solid ${config.color}60`,
              }}
            />
            {isDev && <span className="absolute -top-2 -right-1 text-xl">⚡</span>}
            {isOwner && <span className="absolute -top-2 -right-1 text-xl">👑</span>}
            {role === 'vvip' && <span className="absolute -bottom-1 -right-1 text-lg">💎</span>}
            {role === 'vip' && <span className="absolute -bottom-1 -right-1 text-lg">⭐</span>}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <RoleName name={user.displayName} role={role} className="text-xl" />
            <div className="flex items-center gap-3 mt-1">
              <RoleBadge role={role} size="sm" />
              <span className="text-sm text-gray-300">
                Level {user.level || 1}
              </span>
            </div>
            {user.title && (
              <p className="text-sm mt-1 italic" style={{ color: config.color }}>
                &quot;{user.title}&quot;
              </p>
            )}
          </div>
        </div>
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
        <p className="text-yellow-100 italic text-base leading-relaxed">
          &quot;Gw cuma orang kismin yang punya jiwa pejuang. Nggak punya apa-apa kecuali mimpi bikin tempat nonton donghua terbaik buat kalian semua.&quot;
        </p>
        <p className="text-gray-300 text-xs">
          Mulai dari nol, pelajari coding sendiri, capek, struggle, tapi nggak pernah berhenti. Karena mimpi nggak boleh mati cuma karena kantong tipis. 💪
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
        <p className="text-cyan-100 italic text-base leading-relaxed">
          &quot;The one who built this entire system from scratch. Coding at 3 AM, debugging at 4 AM, crying at 5 AM, deploying at 6 AM.&quot;
        </p>
        <p className="text-gray-300 text-xs">
          Full-stack developer, part-time overthinker, full-time ngoding. Setiap baris kode di Z.XTREAM adalah bukti bahwa mimpi bisa di-build satu commit pada satu waktu. 🚀
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
          <img
            src={donationSettings.qrUrl}
            alt="QR Code Donasi"
            className="w-48 h-48 mx-auto rounded-xl border border-white/10"
          />
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
          <a
            href={donationSettings.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-sm text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <span>💬</span>
            Join Grup Telegram
          </a>
        </div>
      )}
    </div>
  );
}
