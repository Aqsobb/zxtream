export interface User {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  bio: string;
  country: string;
  level: number;
  exp: number;
  totalExp: number;
  title: string;
  badges: string[];
  achievements: string[];
  watchTime: number;
  favorites: string[];
  bookmarks: string[];
  history: WatchHistory[];
  followers: string[];
  following: string[];
  isAdmin: boolean;
  isModerator: boolean;
  isVerified: boolean;
  isBanned: boolean;
  banReason?: string;
  lastLogin: number;
  createdAt: number;
  updatedAt: number;
  settings: UserSettings;
  dailyLoginStreak: number;
  lastDailyLogin: number;
  xpMultiplier: number;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  autoPlay: boolean;
  autoNext: boolean;
  skipIntro: boolean;
  skipEnding: boolean;
  defaultQuality: '360p' | '480p' | '720p' | '1080p';
  defaultSubtitle: string;
  notifications: boolean;
  showNSFW: boolean;
  language: string;
  playbackSpeed: number;
}

export interface WatchHistory {
  animeId: string;
  animeSlug: string;
  episodeId: string;
  episodeNumber: number;
  title: string;
  thumbnail: string;
  timestamp: number;
  progress: number;
  duration: number;
}

export interface Anime {
  id: string;
  slug: string;
  title: string;
  titleJapanese: string;
  synopsis: string;
  thumbnail: string;
  banner: string;
  type: string;
  status: string;
  releaseYear: number;
  season: string;
  genres: string[];
  studios: string[];
  duration: string;
  rating: string;
  episodes: Episode[];
  episodeCount: number;
  malScore: number;
  views: number;
  favorites: number;
  createdAt: number;
  updatedAt: number;
}

export interface Episode {
  id: string;
  animeId: string;
  animeSlug: string;
  number: number;
  title: string;
  thumbnail: string;
  sources: EpisodeSource[];
  duration: number;
  views: number;
  createdAt: number;
}

export interface EpisodeSource {
  server: string;
  url: string;
  quality: string;
  type: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  type: 'anime' | 'episode';
  targetId: string;
  parentId?: string;
  mentions: string[];
  likes: string[];
  replies: string[];
  isPinned: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  reportCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'reply' | 'mention' | 'follow' | 'achievement' | 'event' | 'episode' | 'system';
  title: string;
  message: string;
  link?: string;
  fromUser?: string;
  isRead: boolean;
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  expReward: number;
  badgeId?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export interface LevelInfo {
  level: number;
  title: string;
  minExp: number;
  maxExp: number;
  color: string;
  perks: string[];
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  level: number;
  exp: number;
  title: string;
  badges: string[];
  watchTime: number;
  rank: number;
  country: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'event';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  expiresAt: number;
}

export interface QuestRequirement {
  type: 'login' | 'watch' | 'comment' | 'like' | 'bookmark' | 'share';
  target: number;
  current: number;
}

export interface QuestReward {
  type: 'exp' | 'badge' | 'title';
  value: string | number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: number;
  endDate: number;
  expMultiplier: number;
  specialRewards: string[];
  isActive: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'comment' | 'user' | 'anime';
  targetId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  resolution?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  ip: string;
  createdAt: number;
}

export interface SearchResult {
  animes: Anime[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
