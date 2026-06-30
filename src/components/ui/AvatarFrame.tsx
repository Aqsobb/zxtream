'use client';

import { motion } from 'framer-motion';
import { getRoleConfig } from '@/lib/roles';

interface AvatarFrameProps {
  src: string;
  role: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { img: 'w-8 h-8', frame: 'w-10 h-10', ring: 36 },
  md: { img: 'w-10 h-10', frame: 'w-12 h-12', ring: 48 },
  lg: { img: 'w-16 h-16', frame: 'w-20 h-20', ring: 80 },
  xl: { img: 'w-24 h-24', frame: 'w-28 h-28', ring: 112 },
};

export default function AvatarFrame({ src, role, size = 'md', showStatus, isOnline, className = '' }: AvatarFrameProps) {
  const config = getRoleConfig(role);
  const s = sizeMap[size];
  const isDev = role === 'dev';
  const isOwner = role === 'owner';
  const isVVIP = role === 'vvip';
  const isVIP = role === 'vip';
  const isPremium = isDev || isOwner || isVVIP || isVIP;

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: s.ring, height: s.ring }}>
      {/* Outer animated ring for dev/owner */}
      {isOwner && (
        <motion.div
          className="absolute -inset-1 rounded-2xl"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${config.color}80, transparent, ${config.color}80, transparent)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Animated glow ring for dev */}
      {isDev && (
        <motion.div
          className="absolute -inset-0.5 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${config.color}60, transparent 30%, transparent 70%, ${config.color}60)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* VVIP diamond border */}
      {isVVIP && (
        <motion.div
          className="absolute -inset-0.5 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${config.color}50, #ec489980, ${config.color}50)`,
            backgroundSize: '200% 200%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* VIP simple glow */}
      {isVIP && (
        <div
          className="absolute -inset-0.5 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${config.color}40, transparent, ${config.color}40)`,
          }}
        />
      )}

      {/* Main image container */}
      <div
        className={`relative ${s.img} rounded-2xl overflow-hidden`}
        style={{
          border: `2px solid ${isPremium ? config.color + '80' : '#37415180'}`,
          boxShadow: isPremium ? `0 0 12px ${config.color}30` : undefined,
        }}
      >
        <img
          src={src || '/images/default-avatar.png'}
          alt=""
          className="w-full h-full object-cover"
        />

        {/* Owner crown overlay */}
        {isOwner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}`}>👑</span>
          </div>
        )}

        {/* Dev lightning overlay */}
        {isDev && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}`}>⚡</span>
          </div>
        )}

        {/* VVIP diamond overlay */}
        {isVVIP && (
          <div className="absolute bottom-0 right-0 p-0.5 bg-dark-900/80 rounded-tl-lg">
            <span className={`${size === 'sm' ? 'text-[8px]' : 'text-xs'}`}>💎</span>
          </div>
        )}

        {/* VIP star overlay */}
        {isVIP && (
          <div className="absolute bottom-0 right-0 p-0.5 bg-dark-900/80 rounded-tl-lg">
            <span className={`${size === 'sm' ? 'text-[8px]' : 'text-xs'}`}>⭐</span>
          </div>
        )}
      </div>

      {/* Online status */}
      {showStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-dark-900 ${
          isOnline ? 'bg-green-500' : 'bg-gray-500'
        }`} />
      )}

      {/* Floating particles for owner/dev */}
      {isPremium && size !== 'sm' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(isOwner ? 6 : isDev ? 5 : isVVIP ? 3 : 0)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: '2px',
                height: '2px',
                background: config.color,
                left: `${20 + Math.random() * 60}%`,
                bottom: '10%',
              }}
              animate={{
                y: [0, -30 - Math.random() * 20],
                opacity: [0.8, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1.2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
