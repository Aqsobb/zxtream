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
        boxShadow: config.glow !== 'none' ? config.glow : undefined,
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
        <motion.span
          animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg"
        >
          👑
        </motion.span>
      )}
      {config.diamond && (
        <motion.span
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg"
        >
          💎
        </motion.span>
      )}
      <span
        className="font-bold"
        style={{
          color: config.color,
          textShadow: config.glow !== 'none' ? `0 0 12px ${config.color}60` : undefined,
        }}
      >
        {name}
      </span>
      {config.particles && <RoleParticles color={config.color} />}
    </span>
  );
}

function RoleParticles({ color }: { color: string }) {
  return (
    <span className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(5)].map((_, i) => (
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
            delay: i * 0.3,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border ${config.border} ${className}`}
      style={{
        boxShadow: config.glow !== 'none' ? config.glow : undefined,
      }}
    >
      {/* Animated banner background */}
      <div className="absolute inset-0" style={{ background: config.bannerGradient }} />

      {/* Animated border glow for dev/owner */}
      {(isDev || isOwner) && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: `2px solid transparent`,
            background: `linear-gradient(135deg, ${config.color}50, transparent 40%, transparent 60%, ${config.color}50) border-box`,
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Floating particles for premium */}
      {(isDev || isOwner || isPremium) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: config.color,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100 - Math.random() * 100],
                x: [0, Math.random() * 60 - 30],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Rotating ring for owner */}
      {isOwner && (
        <motion.div
          className="absolute -inset-1 rounded-2xl pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${config.color}40, transparent, ${config.color}40, transparent)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          {/* Avatar with glow */}
          <div className="relative">
            <motion.img
              src={user.photoURL || '/images/default-avatar.png'}
              alt={user.displayName}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{
                boxShadow: config.glow !== 'none' ? `0 0 25px ${config.color}50` : undefined,
                border: `3px solid ${config.color}80`,
              }}
              animate={isDev || isOwner ? { scale: [1, 1.02, 1] } : undefined}
              transition={{ duration: 3, repeat: Infinity }}
            />
            {config.crown && (
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-1 text-2xl"
              >
                👑
              </motion.div>
            )}
            {config.diamond && (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 text-lg"
              >
                💎
              </motion.div>
            )}
            {(role === 'vip') && (
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-1 -right-1 text-lg"
              >
                ⭐
              </motion.div>
            )}
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
    </motion.div>
  );
}

export function OwnerInfoSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-yellow-500/30 p-6"
      style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #2d1b4e 30%, #4a1942 60%, #1a0533 100%)',
        boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)',
      }}
    >
      {/* Rotating border */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent, #f59e0b40, transparent, #f59e0b40, transparent)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating gold particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -60], opacity: [0, 0.8, 0], scale: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.span
            animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-3xl"
          >
            👑
          </motion.span>
          <h3 className="text-xl font-extrabold text-yellow-400">Boss Besar Z.XTREAM</h3>
        </div>

        <div className="space-y-3 text-sm text-gray-300">
          <p className="text-yellow-200/80 italic text-base leading-relaxed">
            &quot;Gw cuma orang kismin yang punya jiwa pejuang. Nggak punya apa-apa kecuali mimpi bikin tempat nonton donghua terbaik buat kalian semua.&quot;
          </p>
          <p className="text-gray-400 text-xs">
            Mulai dari nol, pelajari coding sendiri, capek, struggle, tapi nggak pernah berhenti. Karena mimpi nggak boleh mati cuma karena kantong tipis. 💪
          </p>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-yellow-400 font-bold">⚡ The One and Only Boss</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">UID: 33333</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function DevInfoSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-cyan-500/30 p-6"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 30%, #24243e 60%, #0f0c29 100%)',
        boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)',
      }}
    >
      {/* Matrix rain effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-400 text-xs font-mono"
            style={{ left: `${(i / 15) * 100}%`, top: '-20px' }}
            animate={{ y: ['0vh', '100vh'] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.3, ease: 'linear' }}
          >
            {['01', '10', '11', '00', '⚡'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="text-3xl"
          >
            ⚡
          </motion.span>
          <h3 className="text-xl font-extrabold text-cyan-400">Developer Z.XTREAM</h3>
        </div>

        <div className="space-y-3 text-sm text-gray-300">
          <p className="text-cyan-200/80 italic text-base leading-relaxed">
            &quot;The one who built this entire system from scratch. Coding at 3 AM, debugging at 4 AM, crying at 5 AM, deploying at 6 AM.&quot;
          </p>
          <p className="text-gray-400 text-xs">
            Full-stack developer, part-time overthinker, full-time ngoding. Setiap baris kode di Z.XTREAM adalah bukti bahwa mimpi bisa di-build satu commit pada satu waktu. 🚀
          </p>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-cyan-400 font-bold">⚡ The Creator</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">UID: 33333</span>
          </div>
        </div>
      </div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-6 bg-white/5"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">☕</span>
        Donasi & Support
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Kalau kalian mau support, boleh donasi seikhlasnya. Nggak wajib, tapi sangat membantu! 🙏
      </p>

      {donationSettings.qrUrl && (
        <div className="mb-4">
          <img
            src={donationSettings.qrUrl}
            alt="QR Code Donasi"
            className="w-48 h-48 mx-auto rounded-xl border border-white/10"
          />
          <p className="text-center text-xs text-gray-500 mt-2">Scan QR untuk donasi</p>
        </div>
      )}

      {donationSettings.danaNumber && (
        <div className="text-center mb-2">
          <span className="text-sm text-gray-400">Dana: </span>
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
    </motion.div>
  );
}
