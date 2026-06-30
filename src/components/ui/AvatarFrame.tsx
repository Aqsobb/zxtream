'use client';

import { HiOutlineCode, HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineStar } from 'react-icons/hi';

interface AvatarFrameProps {
  src: string;
  role: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { img: 'w-8 h-8', ring: 36 },
  md: { img: 'w-10 h-10', ring: 48 },
  lg: { img: 'w-16 h-16', ring: 80 },
  xl: { img: 'w-24 h-24', ring: 112 },
};

const iconSizes: Record<string, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
};

export default function AvatarFrame({ src, role, size = 'md', showStatus, isOnline, className = '' }: AvatarFrameProps) {
  const s = sizeMap[size];
  const iconSize = iconSizes[size];
  const isOwner = role === 'owner';
  const isDev = role === 'dev';
  const isVVIP = role === 'vvip';
  const isVIP = role === 'vip';
  const isPremium = isOwner || isDev || isVVIP || isVIP;
  const showEffects = isPremium && isOnline;

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: s.ring, height: s.ring }}>
      {/* Owner: subtle glowing purple border */}
      {isOwner && showEffects && (
        <div className="absolute -inset-0.5 rounded-2xl border-2 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.4)] pointer-events-none" />
      )}

      {/* Dev: subtle cyan glow border */}
      {isDev && showEffects && (
        <div className="absolute -inset-0.5 rounded-2xl border-2 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.4)] pointer-events-none" />
      )}

      {/* VVIP: diamond shimmer border */}
      {isVVIP && showEffects && (
        <>
          <div className="absolute -inset-0.5 rounded-2xl border-2 border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.4)] pointer-events-none" />
          <div className="absolute -inset-0.5 rounded-2xl border-2 border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.15)] pointer-events-none" />
        </>
      )}

      {/* VIP: warm gold border */}
      {isVIP && showEffects && (
        <div className="absolute -inset-0.5 rounded-2xl border-2 border-amber-500/60 shadow-[0_0_12px_rgba(251,191,36,0.4)] pointer-events-none" />
      )}

      {/* Main image container */}
      <div className={`relative ${s.img} rounded-2xl overflow-hidden z-10 border-2 ${
        showEffects ? 'border-transparent' : 'border-gray-600/50'
      }`}>
        <img
          src={src || '/images/default-avatar.png'}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Role icon overlay (top-right) */}
      {showEffects && (
        <div className="absolute -top-0.5 -right-0.5 z-20">
          {isOwner && <HiOutlineShieldCheck className={`${iconSize} text-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]`} />}
          {isDev && <HiOutlineCode className={`${iconSize} text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]`} />}
          {isVVIP && <HiOutlineSparkles className={`${iconSize} text-pink-400 drop-shadow-[0_0_4px_rgba(236,72,153,0.6)] animate-pulse`} />}
          {isVIP && <HiOutlineStar className={`${iconSize} text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]`} />}
        </div>
      )}

      {/* Online status */}
      {showStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-dark-900 z-20 ${
          isOnline ? 'bg-green-500' : 'bg-gray-500'
        }`} />
      )}
    </div>
  );
}
