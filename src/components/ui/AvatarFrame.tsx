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
  const isVideo = src && (src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.gif'));

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

      {/* Dev: premium galaxy frame */}
      {isDev && animated && (
        <>
          {/* Rotating galaxy ring */}
          <motion.div
            className="absolute -inset-2 rounded-2xl pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg,
                transparent,
                rgba(6,182,212,0.6) 8%,
                transparent 16%,
                rgba(99,102,241,0.5) 24%,
                transparent 32%,
                rgba(168,85,247,0.4) 40%,
                transparent 48%,
                rgba(139,92,246,0.5) 56%,
                transparent 64%,
                rgba(6,182,212,0.6) 72%,
                transparent 80%,
                rgba(99,102,241,0.5) 88%,
                transparent
              )`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          {/* Pulsing outer glow */}
          <motion.div
            className="absolute -inset-3 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 15px rgba(6,182,212,0.3), 0 0 30px rgba(99,102,241,0.15)',
                '0 0 25px rgba(6,182,212,0.5), 0 0 50px rgba(139,92,246,0.25)',
                '0 0 15px rgba(6,182,212,0.3), 0 0 30px rgba(99,102,241,0.15)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Inner shimmer */}
          <motion.div
            className="absolute -inset-0.5 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.4), transparent 30%, transparent 70%, rgba(168,85,247,0.4))',
            }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </>
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
        {isVideo ? (
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={src || '/images/default-avatar.png'}
            alt=""
            className="w-full h-full object-cover"
          />
        )}

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

        {/* Dev premium galaxy overlay */}
        {isDev && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.1), rgba(168,85,247,0.15))',
            }}
            animate={{
              background: [
                'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.1), rgba(168,85,247,0.15))',
                'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15), rgba(99,102,241,0.2))',
                'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.1), rgba(168,85,247,0.15))',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.span
              className={s.fontSize}
              animate={{
                scale: [1, 1.3, 1],
                filter: [
                  'drop-shadow(0 0 3px rgba(6,182,212,0.6))',
                  'drop-shadow(0 0 8px rgba(139,92,246,0.9))',
                  'drop-shadow(0 0 3px rgba(6,182,212,0.6))',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡
            </motion.span>
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

      {/* Galaxy sparks for dev */}
      {isDev && animated && size !== 'sm' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-3 rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${['#06b6d4', '#818cf8', '#a855f7', '#6366f1'][i % 4]}, transparent)`,
                left: `${15 + Math.random() * 70}%`,
                top: `${10 + Math.random() * 50}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scaleY: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                delay: i * 0.35 + Math.random() * 0.3,
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
