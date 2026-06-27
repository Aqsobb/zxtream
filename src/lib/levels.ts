import { LevelInfo, Achievement, Badge } from '@/types';

export const TITLES: LevelInfo[] = [
  { level: 1, title: 'Rookie', minExp: 0, maxExp: 100, color: '#94a3b8', perks: [] },
  { level: 2, title: 'Beginner', minExp: 100, maxExp: 300, color: '#60a5fa', perks: ['Custom Avatar'] },
  { level: 3, title: 'Anime Hunter', minExp: 300, maxExp: 600, color: '#34d399', perks: ['Custom Banner'] },
  { level: 4, title: 'Otaku', minExp: 600, maxExp: 1000, color: '#a78bfa', perks: ['Custom Bio'] },
  { level: 5, title: 'Veteran', minExp: 1000, maxExp: 1500, color: '#f472b6', perks: ['Priority Support'] },
  { level: 6, title: 'Elite', minExp: 1500, maxExp: 2500, color: '#fb923c', perks: ['Exclusive Badge'] },
  { level: 7, title: 'Mythic', minExp: 2500, maxExp: 4000, color: '#e879f9', perks: ['Custom Title Color'] },
  { level: 8, title: 'Legend', minExp: 4000, maxExp: 6000, color: '#facc15', perks: ['Profile Highlight'] },
  { level: 9, title: 'Immortal', minExp: 6000, maxExp: 10000, color: '#2dd4bf', perks: ['Animated Avatar'] },
  { level: 10, title: 'Supreme', minExp: 10000, maxExp: 15000, color: '#f87171', perks: ['Exclusive Emotes'] },
  { level: 11, title: 'Galactic', minExp: 15000, maxExp: 25000, color: '#818cf8', perks: ['Custom Theme'] },
  { level: 12, title: 'Eternal', minExp: 25000, maxExp: 50000, color: '#22d3ee', perks: ['VIP Badge'] },
  { level: 13, title: 'Cosmic', minExp: 50000, maxExp: 100000, color: '#a855f7', perks: ['Cosmic Aura'] },
  { level: 14, title: 'Developer', minExp: 0, maxExp: 0, color: '#4ade80', perks: ['All Permissions'] },
  { level: 15, title: 'Moderator', minExp: 0, maxExp: 0, color: '#60a5fa', perks: ['Moderation Tools'] },
  { level: 16, title: 'Owner', minExp: 0, maxExp: 0, color: '#facc15', perks: ['Full Access'] },
];

export const EXP_VALUES = {
  LOGIN: 10,
  DAILY_LOGIN: 25,
  WEEKLY_LOGIN: 100,
  WATCH_EPISODE: 15,
  COMMENT: 10,
  LIKE: 5,
  BOOKMARK: 5,
  SHARE: 10,
  FOLLOW: 5,
  ACHIEVEMENT_UNLOCK: 50,
  QUEST_COMPLETE: 30,
  EVENT_BONUS: 50,
};

export function getLevelForExp(exp: number): LevelInfo {
  let result = TITLES[0];
  for (const title of TITLES) {
    if (title.level >= 14) continue;
    if (exp >= title.minExp) {
      result = title;
    }
  }
  return result;
}

export function getExpForNextLevel(currentExp: number): number {
  const level = getLevelForExp(currentExp);
  return level.maxExp - currentExp;
}

export function getProgressPercent(currentExp: number): number {
  const level = getLevelForExp(currentExp);
  if (level.maxExp === 0) return 100;
  const progress = currentExp - level.minExp;
  const range = level.maxExp - level.minExp;
  return Math.min(100, Math.floor((progress / range) * 100));
}

export function calculateLevel(totalExp: number): { level: number; title: string; color: string } {
  const levelInfo = getLevelForExp(totalExp);
  return {
    level: levelInfo.level,
    title: levelInfo.title,
    color: levelInfo.color,
  };
}

export function getBadgeById(badges: Badge[], id: string): Badge | undefined {
  return badges.find(b => b.id === id);
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#94a3b8';
    case 'uncommon': return '#4ade80';
    case 'rare': return '#60a5fa';
    case 'epic': return '#a78bfa';
    case 'legendary': return '#facc15';
    case 'mythic': return '#f87171';
    default: return '#94a3b8';
  }
}
