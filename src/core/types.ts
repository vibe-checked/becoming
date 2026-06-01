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

export type Favorite = {
  id: string;
  themeId: ThemeId;
  affirmation: string;
  gradientIndex: number;
  savedAt: number;
};

export type CustomAffirmation = {
  id: string;
  themeId: ThemeId;
  text: string;
  createdAt: number;
};

export type UserPhoto = {
  id: string;
  themeId: ThemeId;
  uri: string;
  addedAt: number;
};

export type PersistedState = {
  selectedTheme: ThemeId;
  selectedDuration: DurationMin;
  sessionHistory: SessionRecord[];
  favorites: Favorite[];
  customAffirmations: CustomAffirmation[];
  userPhotos: UserPhoto[];
  hasLaunched: boolean;
  sessionCount: number;
  currentStreak: number;
  lastSessionDate: string | null;
  version: 2;
};
