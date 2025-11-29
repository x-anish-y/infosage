export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

export const VERDICT_COLORS = {
  true: '#10b981',
  false: '#ef4444',
  mixed: '#f59e0b',
  unverified: '#6b7280',
  misleading: '#f59e0b',
  'out-of-context': '#8b5cf6',
  satire: '#06b6d4',
};

export const VERDICT_LABELS = {
  true: 'TRUE',
  false: 'FALSE',
  mixed: 'MIXED',
  unverified: 'UNVERIFIED',
  misleading: 'MISLEADING',
  'out-of-context': 'OUT OF CONTEXT',
  satire: 'SATIRE',
};

export const SENTIMENT_ICONS = {
  fear: '😨',
  anger: '😠',
  neutral: '😐',
  hope: '🙂',
  sadness: '😢',
};

export const PLATFORMS = {
  twitter: 'Twitter',
  telegram: 'Telegram',
  rss: 'RSS',
  youtube: 'YouTube',
  web: 'Web',
  image: 'Image',
  video: 'Video',
};

export const RISK_TIERS = ['low', 'medium', 'high'];
export const TRENDS = ['accelerating', 'stable', 'declining'];
