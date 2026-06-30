export type UserRole = 'dev' | 'owner' | 'vvip' | 'vip' | 'member';

export interface RoleConfig {
  name: string;
  label: string;
  color: string;
  gradient: string;
  glow: string;
  badge: string;
  border: string;
  animation: string;
  particles?: boolean;
  crown?: boolean;
  diamond?: boolean;
  star?: boolean;
  title?: string;
  bannerGradient?: string;
  profileEffect?: string;
  emoticons: string[];
  maxEmoticons: number;
  canCustomEmoticon: boolean;
}

export const ROLES: Record<UserRole, RoleConfig> = {
  dev: {
    name: 'dev',
    label: '⚡ DEVELOPER',
    color: '#a78bfa',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: '0 0 25px rgba(167,139,250,0.5), 0 0 50px rgba(139,92,246,0.3), 0 0 80px rgba(168,85,247,0.15)',
    badge: '⚡',
    border: 'border-purple-500/60',
    animation: 'animate-pulse',
    particles: true,
    crown: false,
    title: 'Penghancur & Pencipta',
    bannerGradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 30%, #24243e 60%, #0f0c29 100%)',
    profileEffect: 'galaxy-void',
    emoticons: ['⚡', '🔥', '💀', '🗿', '😈', '👾', '🤖', '👻', '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎵', '💎', '👑', '🦊', '🐉', '🦄', '🌈', '🚀', '💫', '✨', '🎉', '🎊', '💯', '🏆', '⚜️', '🗡️', '⚔️', '🛡️', '💣', '🧨', '🔱'],
    maxEmoticons: 999,
    canCustomEmoticon: true,
  },
  owner: {
    name: 'owner',
    label: 'OWNER',
    color: '#f59e0b',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    glow: '0 0 25px rgba(245, 158, 11, 0.6), 0 0 50px rgba(245, 158, 11, 0.3), 0 0 80px rgba(245, 158, 11, 0.15)',
    badge: '👑',
    border: 'border-yellow-500/60',
    animation: 'animate-pulse',
    particles: true,
    crown: true,
    title: 'Boss Besar',
    bannerGradient: 'linear-gradient(135deg, #1a0533 0%, #2d1b4e 25%, #4a1942 50%, #2d1b4e 75%, #1a0533 100%)',
    profileEffect: 'golden-explosion',
    emoticons: ['👑', '🔥', '💀', '🗿', '😈', '👾', '🤖', '👻', '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎵', '💎', '⭐', '🦊', '🐉', '🌈', '🚀', '💫', '✨', '🎉', '🎊', '💯', '🏆', '⚜️', '👁️‍🗨️', '🏴‍☠️'],
    maxEmoticons: 999,
    canCustomEmoticon: true,
  },
  vvip: {
    name: 'vvip',
    label: 'VVIP',
    color: '#a855f7',
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
    glow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.25), 0 0 60px rgba(168, 85, 247, 0.1)',
    badge: '💎',
    border: 'border-purple-500/50',
    animation: 'animate-glow',
    particles: true,
    diamond: true,
    title: 'Diamond Member',
    bannerGradient: 'linear-gradient(135deg, #2d1b4e 0%, #6b21a8 30%, #a855f7 50%, #6b21a8 70%, #2d1b4e 100%)',
    profileEffect: 'diamond-shimmer',
    emoticons: ['💎', '✨', '🔥', '💀', '🗿', '😈', '👻', '⭐', '💫', '🎉', '🎊', '💯', '🏆', '💜', '🦄', '🌸', '🦋', '🌙', '⭐'],
    maxEmoticons: 20,
    canCustomEmoticon: false,
  },
  vip: {
    name: 'vip',
    label: 'VIP',
    color: '#3b82f6',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    glow: '0 0 15px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.2)',
    badge: '⭐',
    border: 'border-blue-500/50',
    animation: '',
    star: true,
    title: 'VIP Member',
    bannerGradient: 'linear-gradient(135deg, #0c1a3a 0%, #1e3a5f 30%, #2563eb 50%, #1e3a5f 70%, #0c1a3a 100%)',
    profileEffect: 'star-glow',
    emoticons: ['⭐', '🔥', '💀', '🗿', '😊', '😎', '🤩', '💯', '✨', '🎉', '👍', '❤️'],
    maxEmoticons: 12,
    canCustomEmoticon: false,
  },
  member: {
    name: 'member',
    label: 'MEMBER',
    color: '#6b7280',
    gradient: 'from-gray-500 to-gray-600',
    glow: 'none',
    badge: '🎮',
    border: 'border-gray-500/30',
    animation: '',
    title: '',
    bannerGradient: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
    profileEffect: '',
    emoticons: [],
    maxEmoticons: 0,
    canCustomEmoticon: false,
  },
};

export function getRoleConfig(role: string): RoleConfig {
  return ROLES[role as UserRole] || ROLES.member;
}

export function canUseEmoticon(role: string): boolean {
  return ['owner', 'dev', 'vvip', 'vip'].includes(role);
}

export function getEmoticonSet(role: string): string[] {
  return getRoleConfig(role).emoticons;
}
