import { ThemeConfig, ThemeId } from './types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  rich: {
    id: 'rich',
    label: 'Rich',
    emoji: '💰',
    palette: {
      bg: '#1a1408',
      accent: '#d4a843',
      cardBg: 'rgba(212,168,67,0.12)',
      text: '#f5ecd4',
      muted: '#8a7b5a',
    },
    gradients: [
      { colors: ['#2d1f0a', '#6b4f1d', '#d4a843'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ['#1a1408', '#8b6914', '#f5d060'], start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
      { colors: ['#3d2b0f', '#a07828', '#e8c84a'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
  love: {
    id: 'love',
    label: 'Love',
    emoji: '❤️',
    palette: {
      bg: '#1a0810',
      accent: '#d4637a',
      cardBg: 'rgba(212,99,122,0.12)',
      text: '#f5d4de',
      muted: '#8a5a6b',
    },
    gradients: [
      { colors: ['#2d0a18', '#8b2040', '#d4637a'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ['#1a0810', '#a03050', '#f07090'], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
      { colors: ['#3d0f20', '#c04868', '#f5a0b8'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
  health: {
    id: 'health',
    label: 'Health',
    emoji: '🌿',
    palette: {
      bg: '#081a10',
      accent: '#43d478',
      cardBg: 'rgba(67,212,120,0.12)',
      text: '#d4f5e0',
      muted: '#5a8a6b',
    },
    gradients: [
      { colors: ['#0a2d15', '#1d6b3a', '#43d478'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ['#081a10', '#208848', '#50e890'], start: { x: 0.3, y: 0 }, end: { x: 0.7, y: 1 } },
      { colors: ['#0f3d1e', '#30a058', '#70f0a0'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
  confidence: {
    id: 'confidence',
    label: 'Confidence',
    emoji: '🦁',
    palette: {
      bg: '#08101a',
      accent: '#4378d4',
      cardBg: 'rgba(67,120,212,0.12)',
      text: '#d4e0f5',
      muted: '#5a6b8a',
    },
    gradients: [
      { colors: ['#0a152d', '#1d3a6b', '#4378d4'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ['#08101a', '#204888', '#5090e8'], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
      { colors: ['#0f1e3d', '#3058a0', '#70a0f0'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
  adventure: {
    id: 'adventure',
    label: 'Adventure',
    emoji: '🏔️',
    palette: {
      bg: '#1a1008',
      accent: '#d49043',
      cardBg: 'rgba(212,144,67,0.12)',
      text: '#f5e4d4',
      muted: '#8a755a',
    },
    gradients: [
      { colors: ['#2d1a0a', '#6b3f1d', '#d49043'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ['#1a1008', '#885820', '#e89050'], start: { x: 0.4, y: 0 }, end: { x: 0.6, y: 1 } },
      { colors: ['#3d250f', '#a06830', '#f0b070'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
  family: {
    id: 'family',
    label: 'Family',
    emoji: '🏡',
    palette: {
      bg: '#1a1508',
      accent: '#d4b843',
      cardBg: 'rgba(212,184,67,0.12)',
      text: '#f5efd4',
      muted: '#8a805a',
    },
    gradients: [
      { colors: ['#2d240a', '#6b561d', '#d4b843'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ['#1a1508', '#887020', '#e8c050'], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
      { colors: ['#3d300f', '#a08830', '#f0d070'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
  purpose: {
    id: 'purpose',
    label: 'Purpose',
    emoji: '🔮',
    palette: {
      bg: '#10081a',
      accent: '#7843d4',
      cardBg: 'rgba(120,67,212,0.12)',
      text: '#e0d4f5',
      muted: '#6b5a8a',
    },
    gradients: [
      { colors: ['#150a2d', '#3a1d6b', '#7843d4'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ['#10081a', '#482088', '#7050e8'], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
      { colors: ['#1e0f3d', '#5830a0', '#9070f0'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
  career: {
    id: 'career',
    label: 'Career',
    emoji: '🚀',
    palette: {
      bg: '#0a0a12',
      accent: '#a0a0b0',
      cardBg: 'rgba(160,160,176,0.12)',
      text: '#e8e8f0',
      muted: '#6a6a78',
    },
    gradients: [
      { colors: ['#0a0a12', '#2a2a3a', '#5a5a70'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ['#12121a', '#3a3a4a', '#707088'], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
      { colors: ['#08080f', '#282838', '#606078'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
};

export const ALL_THEME_IDS: ThemeId[] = [
  'rich', 'love', 'health', 'confidence',
  'adventure', 'family', 'purpose', 'career',
];
