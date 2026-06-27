export type UserRole = 'owner' | 'vvip' | 'vip' | 'member';

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
}

export const ROLES: Record<UserRole, RoleConfig> = {
  owner: {
    name: 'owner',
    label: 'OWNER',
    color: '#f59e0b',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    glow: '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.3)',
    badge: '👑',
    border: 'border-yellow-500/50',
    animation: 'animate-pulse',
    particles: true,
    crown: true,
  },
  vvip: {
    name: 'vvip',
    label: 'VVIP',
    color: '#a855f7',
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
    glow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
    badge: '💎',
    border: 'border-purple-500/50',
    animation: 'animate-glow',
    particles: true,
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
  },
};

export function getRoleConfig(role: string): RoleConfig {
  return ROLES[role as UserRole] || ROLES.member;
}
