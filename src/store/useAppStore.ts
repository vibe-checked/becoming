import { create } from 'zustand';
import {
  CustomAffirmation,
  DurationMin,
  Favorite,
  PersistedState,
  ReflectionEmoji,
  SessionRecord,
  ThemeId,
  UserPhoto,
} from '../core/types';
import { saveState, loadState } from '../core/persistence';

type Store = {
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
  dismissedPrompts: string[];
  dailyReminderHour: number | null;

  screen: 'theme_picker' | 'session';
  sessionPhase: 'idle' | 'playing' | 'reflection';
  sessionStartedAt: number | null;

  selectTheme: (id: ThemeId) => void;
  selectDuration: (d: DurationMin) => void;
  startSession: () => void;
  endSession: () => void;
  submitReflection: (emoji: ReflectionEmoji, note: string) => void;

  addFavorite: (fav: Omit<Favorite, 'id' | 'savedAt'>) => void;
  removeFavorite: (id: string) => void;
  isFavorited: (themeId: ThemeId, affirmation: string) => boolean;

  addCustomAffirmation: (themeId: ThemeId, text: string) => void;
  removeCustomAffirmation: (id: string) => void;
  editCustomAffirmation: (id: string, text: string) => void;

  addUserPhoto: (themeId: ThemeId, uri: string) => void;
  removeUserPhoto: (id: string) => void;

  dismissPrompt: (key: string) => void;
  setDailyReminder: (hour: number | null) => void;

  hydrate: () => Promise<void>;
  persist: () => void;
};

const MAX_HISTORY = 200;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useAppStore = create<Store>((set, get) => ({
  selectedTheme: 'rich',
  selectedDuration: 5,
  sessionHistory: [],
  favorites: [],
  customAffirmations: [],
  userPhotos: [],
  hasLaunched: false,
  sessionCount: 0,
  currentStreak: 0,
  lastSessionDate: null,
  dismissedPrompts: [],
  dailyReminderHour: null,

  screen: 'theme_picker',
  sessionPhase: 'idle',
  sessionStartedAt: null,

  selectTheme: (id) => {
    set({ selectedTheme: id });
    get().persist();
  },

  selectDuration: (d) => {
    set({ selectedDuration: d });
    get().persist();
  },

  startSession: () => {
    set({
      screen: 'session',
      sessionPhase: 'playing',
      sessionStartedAt: Date.now(),
      hasLaunched: true,
    });
    get().persist();
  },

  endSession: () => {
    set({ sessionPhase: 'reflection' });
  },

  submitReflection: (emoji, note) => {
    const s = get();
    const record: SessionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      themeId: s.selectedTheme,
      durationMin: s.selectedDuration,
      reflection: emoji,
      note,
      completedAt: Date.now(),
    };
    const history = [record, ...s.sessionHistory].slice(0, MAX_HISTORY);

    const today = todayStr();
    let streak = s.currentStreak;
    if (s.lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      streak = s.lastSessionDate === yStr ? streak + 1 : 1;
    }

    set({
      sessionHistory: history,
      sessionPhase: 'idle',
      screen: 'theme_picker',
      sessionStartedAt: null,
      sessionCount: s.sessionCount + 1,
      currentStreak: streak,
      lastSessionDate: today,
    });
    get().persist();
  },

  addFavorite: (fav) => {
    const s = get();
    const exists = s.favorites.some(
      (f) => f.themeId === fav.themeId && f.affirmation === fav.affirmation,
    );
    if (exists) return;
    const newFav: Favorite = {
      ...fav,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      savedAt: Date.now(),
    };
    set({ favorites: [...s.favorites, newFav] });
    get().persist();
  },

  removeFavorite: (id) => {
    set({ favorites: get().favorites.filter((f) => f.id !== id) });
    get().persist();
  },

  isFavorited: (themeId, affirmation) => {
    return get().favorites.some(
      (f) => f.themeId === themeId && f.affirmation === affirmation,
    );
  },

  addCustomAffirmation: (themeId, text) => {
    const newAff: CustomAffirmation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      themeId,
      text,
      createdAt: Date.now(),
    };
    set({ customAffirmations: [...get().customAffirmations, newAff] });
    get().persist();
  },

  removeCustomAffirmation: (id) => {
    set({ customAffirmations: get().customAffirmations.filter((a) => a.id !== id) });
    get().persist();
  },

  editCustomAffirmation: (id, text) => {
    set({
      customAffirmations: get().customAffirmations.map((a) =>
        a.id === id ? { ...a, text } : a,
      ),
    });
    get().persist();
  },

  dismissPrompt: (key) => {
    const s = get();
    if (!s.dismissedPrompts.includes(key)) {
      set({ dismissedPrompts: [...s.dismissedPrompts, key] });
      get().persist();
    }
  },

  setDailyReminder: (hour) => {
    set({ dailyReminderHour: hour });
    get().persist();
  },

  addUserPhoto: (themeId, uri) => {
    const photo: UserPhoto = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      themeId,
      uri,
      addedAt: Date.now(),
    };
    set({ userPhotos: [...get().userPhotos, photo] });
    get().persist();
  },

  removeUserPhoto: (id) => {
    set({ userPhotos: get().userPhotos.filter((p) => p.id !== id) });
    get().persist();
  },

  hydrate: async () => {
    const saved = await loadState();
    if (saved) {
      set({
        selectedTheme: saved.selectedTheme,
        selectedDuration: saved.selectedDuration,
        sessionHistory: saved.sessionHistory,
        favorites: saved.favorites,
        customAffirmations: saved.customAffirmations,
        userPhotos: saved.userPhotos,
        hasLaunched: saved.hasLaunched,
        sessionCount: saved.sessionCount,
        currentStreak: saved.currentStreak,
        lastSessionDate: saved.lastSessionDate,
        dismissedPrompts: saved.dismissedPrompts || [],
        dailyReminderHour: saved.dailyReminderHour ?? null,
      });
    }
  },

  persist: () => {
    const s = get();
    const data: PersistedState = {
      selectedTheme: s.selectedTheme,
      selectedDuration: s.selectedDuration,
      sessionHistory: s.sessionHistory,
      favorites: s.favorites,
      customAffirmations: s.customAffirmations,
      userPhotos: s.userPhotos,
      hasLaunched: s.hasLaunched,
      sessionCount: s.sessionCount,
      currentStreak: s.currentStreak,
      lastSessionDate: s.lastSessionDate,
      dismissedPrompts: s.dismissedPrompts,
      dailyReminderHour: s.dailyReminderHour,
      version: 2,
    };
    saveState(data);
  },
}));
