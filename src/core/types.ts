export type ThemeId =
  | 'rich'
  | 'love'
  | 'health'
  | 'confidence'
  | 'adventure'
  | 'family'
  | 'purpose'
  | 'career';

export type DurationMin = 3 | 5 | 10 | 15;

export type ReflectionEmoji = 'grateful' | 'neutral' | 'restless';

export type SessionRecord = {
  id: string;
  themeId: ThemeId;
  durationMin: DurationMin;
  reflection: ReflectionEmoji;
  note: string;
  completedAt: number;
};

export type AppScreen = 'theme_picker' | 'session';

export type SessionPhase = 'idle' | 'playing' | 'reflection';

export type GradientCombo = {
  colors: readonly [string, string, string];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export type ThemeConfig = {
  id: ThemeId;
  label: string;
  emoji: string;
  palette: {
    bg: string;
    accent: string;
    cardBg: string;
    text: string;
    muted: string;
  };
  gradients: readonly [GradientCombo, GradientCombo, GradientCombo];
};

export type PersistedState = {
  selectedTheme: ThemeId;
  selectedDuration: DurationMin;
  sessionHistory: SessionRecord[];
  hasLaunched: boolean;
  version: 1;
};
