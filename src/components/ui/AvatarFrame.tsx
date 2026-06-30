'use client';

import { motion } from 'framer-motion';
import { getRoleConfig } from '@/lib/roles';

interface AvatarFrameProps {
  src: string;
  role: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { img: 'w-8 h-8', frame: 'w-10 h-10', ring: 36, fontSize: 'text-[8px]' },
  md: { img: 'w-10 h-10', frame: 'w-12 h-12', ring: 48, fontSize: 'text-xs' },
  lg: { img: 'w-16 h-16', frame: 'w-20 h-20', ring: 80, fontSize: 'text-sm' },
  xl: { img: 'w-24 h-24', frame: 'w-28 h-28', ring: 112, fontSize: 'text-base' },
};

export default function AvatarFrame({ src, role, size = 'md', showStatus, isOnline, animated = true, className = '' }: AvatarFrameProps) {
  const config = getRoleConfig(role);
  const s = sizeMap[size];
  const isDev = role === 'dev';
  const isOwner = role === 'owner';
  const isVVIP = role === 'vvip';
  const isVIP = role === 'vip';
  const isPremium = isDev || isOwner || isVVIP || isVIP;

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: s.ring, height: s.ring }}>
      {/* Owner: rotating golden ring */}
      {isOwner && animated && (
        <motion.div
          className="absolute -inset-1.5 rounded-2xl"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${config.color}90, transparent, ${config.color}90, transparent)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Owner: pulsing outer glow */}
      {isOwner && animated && (
        <motion.div
          className="absolute -inset-3 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 15px ${config.color}40, 0 0 30px ${config.color}20`,
              `0 0 25px ${config.color}60, 0 0 50px ${config.color}30`,
              `0 0 15px ${config.color}40, 0 0 30px ${config.color}20`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Dev: electric glow */}
      {isDev && animated && (
        <motion.div
          className="absolute -inset-1 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${config.color}70, transparent 30%, transparent 70%, ${config.color}70)`,
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* VVIP: diamond shimmer */}
      {isVVIP && animated && (
        <motion.div
          className="absolute -inset-1 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${config.color}60, #ec489990, ${config.color}60)`,
            backgroundSize: '200% 200%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* VVIP: breathing glow */}
      {isVVIP && animated && (
        <motion.div
          className="absolute -inset-2 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 10px ${config.color}30`,
              `0 0 20px ${config.color}50`,
              `0 0 10px ${config.color}30`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* VIP: star glow */}
      {isVIP && animated && (
        <motion.div
          className="absolute -inset-0.5 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${config.color}50, transparent, ${config.color}50)`,
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Main image container */}
      <motion.div
        className={`relative ${s.img} rounded-2xl overflow-hidden z-10`}
        style={{
          border: `2px solid ${isPremium ? config.color + '90' : '#37415180'}`,
          boxShadow: isPremium ? `0 0 15px ${config.color}40` : undefined,
        }}
        animate={isOwner && animated ? {
          boxShadow: [
            `0 0 10px ${config.color}30`,
            `0 0 20px ${config.color}60`,
            `0 0 10px ${config.color}30`,
          ],
        } : undefined}
        transition={isOwner && animated ? { duration: 2, repeat: Infinity } : undefined}
      >
        <img
          src={src || '/images/default-avatar.png'}
          alt=""
          className="w-full h-full object-cover"
        />

        {/* Owner crown overlay */}
        {isOwner && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            animate={{ backgroundColor: ['rgba(0,0,0,0.2)', 'rgba(245,158,11,0.1)', 'rgba(0,0,0,0.2)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className={s.fontSize}>👑</span>
          </motion.div>
        )}

        {/* Dev lightning overlay */}
        {isDev && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            animate={{ backgroundColor: ['rgba(0,0,0,0.2)', 'rgba(6,182,212,0.1)', 'rgba(0,0,0,0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className={s.fontSize}>⚡</span>
          </motion.div>
        )}

        {/* VVIP diamond overlay */}
        {isVVIP && (
          <div className="absolute bottom-0 right-0 p-0.5 bg-dark-900/80 rounded-tl-lg">
            <motion.span
              className={s.fontSize}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💎
            </motion.span>
          </div>
        )}

        {/* VIP star overlay */}
        {isVIP && (
          <div className="absolute bottom-0 right-0 p-0.5 bg-dark-900/80 rounded-tl-lg">
            <span className={s.fontSize}>⭐</span>
          </div>
        )}
      </motion.div>

      {/* Online status */}
      {showStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-dark-900 z-20 ${
          isOnline ? 'bg-green-500' : 'bg-gray-500'
        }`} />
      )}

      {/* Floating particles for owner */}
      {isOwner && animated && size !== 'sm' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                background: config.color,
                left: `${10 + Math.random() * 80}%`,
                bottom: '10%',
              }}
              animate={{
                y: [0, -25 - Math.random() * 15],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Electric sparks for dev */}
      {isDev && animated && size !== 'sm' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-3 rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${config.color}, transparent)`,
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 40}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scaleY: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.5 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Diamond sparkles for VVIP */}
      {isVVIP && animated && size !== 'sm' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
