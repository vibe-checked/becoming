import { create } from 'zustand';
import {
  CustomAffirmation,
  DurationMin,
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
  customAffirmations: CustomAffirmation[];
  userPhotos: UserPhoto[];
  hasLaunched: boolean;
  sessionCount: number;
  currentStreak: number;
  lastSessionDate: string | null;
  streakFreezeAvailable: boolean;
  freezeGrantedMonth: string | null;
  hiddenLibraryAffirmations: string[];
  dismissedPrompts: string[];
  dailyReminderHour: number | null;
  favoriteImageByTheme: Partial<Record<ThemeId, string>>;

  screen: 'theme_picker' | 'session';
  sessionPhase: 'idle' | 'playing' | 'reflection';
  sessionStartedAt: number | null;
  // Ephemeral (not persisted): set right after a streak milestone is hit so
  // the UI can show a one-off celebration, then cleared via clearMilestone.
  justHitMilestone: number | null;

  selectTheme: (id: ThemeId) => void;
  selectDuration: (d: DurationMin) => void;
  startSession: () => void;
  endSession: () => void;
  submitReflection: (emoji: ReflectionEmoji, note: string) => void;
  clearMilestone: () => void;

  addCustomAffirmation: (themeId: ThemeId, text: string) => void;
  removeCustomAffirmation: (id: string) => void;
  editCustomAffirmation: (id: string, text: string) => void;

  toggleLibraryAffirmation: (text: string) => void;

  addUserPhoto: (themeId: ThemeId, uri: string) => void;
  removeUserPhoto: (id: string) => void;

  setFavoriteImage: (themeId: ThemeId, url: string) => void;

  dismissPrompt: (key: string) => void;
  setDailyReminder: (hour: number | null) => void;

  hydrate: () => Promise<void>;
  persist: () => void;
};

const MAX_HISTORY = 200;
const MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthStr(): string {
  return todayStr().slice(0, 7);
}

export const useAppStore = create<Store>((set, get) => ({
  selectedTheme: 'rich',
  selectedDuration: 5,
  sessionHistory: [],
  customAffirmations: [],
  userPhotos: [],
  hasLaunched: false,
  sessionCount: 0,
  currentStreak: 0,
  lastSessionDate: null,
  streakFreezeAvailable: false,
  freezeGrantedMonth: null,
  hiddenLibraryAffirmations: [],
  dismissedPrompts: [],
  dailyReminderHour: null,
  favoriteImageByTheme: {},

  screen: 'theme_picker',
  sessionPhase: 'idle',
  sessionStartedAt: null,
  justHitMilestone: null,

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
    // One streak freeze is granted per calendar month; it's silently spent
    // to keep a streak alive if exactly one day was missed, so a single busy
    // day doesn't wipe out weeks of practice back to 1.
    let freezeAvailable = s.streakFreezeAvailable;
    let freezeGrantedMonth = s.freezeGrantedMonth;
    const thisMonth = monthStr();
    if (freezeGrantedMonth !== thisMonth) {
      freezeAvailable = true;
      freezeGrantedMonth = thisMonth;
    }

    if (s.lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoStr = twoDaysAgo.toISOString().slice(0, 10);

      if (s.lastSessionDate === yStr) {
        streak = streak + 1;
      } else if (s.lastSessionDate === twoStr && freezeAvailable) {
        streak = streak + 1;
        freezeAvailable = false;
      } else {
        streak = 1;
      }
    }

    const justHitMilestone =
      streak !== s.currentStreak && MILESTONES.includes(streak) ? streak : null;

    set({
      sessionHistory: history,
      sessionPhase: 'idle',
      screen: 'theme_picker',
      sessionStartedAt: null,
      sessionCount: s.sessionCount + 1,
      currentStreak: streak,
      lastSessionDate: today,
      streakFreezeAvailable: freezeAvailable,
      freezeGrantedMonth,
      justHitMilestone,
    });
    get().persist();
  },

  clearMilestone: () => set({ justHitMilestone: null }),

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

  toggleLibraryAffirmation: (text) => {
    const s = get();
    const hidden = s.hiddenLibraryAffirmations.includes(text)
      ? s.hiddenLibraryAffirmations.filter((t) => t !== text)
      : [...s.hiddenLibraryAffirmations, text];
    set({ hiddenLibraryAffirmations: hidden });
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

  setFavoriteImage: (themeId, url) => {
    const s = get();
    const next = { ...s.favoriteImageByTheme };
    if (next[themeId] === url) {
      delete next[themeId];
    } else {
      next[themeId] = url;
    }
    set({ favoriteImageByTheme: next });
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
        sessionHistory: saved.sessionHistory || [],
        customAffirmations: saved.customAffirmations || [],
        userPhotos: saved.userPhotos || [],
        hasLaunched: saved.hasLaunched,
        sessionCount: saved.sessionCount || 0,
        currentStreak: saved.currentStreak || 0,
        lastSessionDate: saved.lastSessionDate ?? null,
        streakFreezeAvailable: saved.streakFreezeAvailable ?? false,
        freezeGrantedMonth: saved.freezeGrantedMonth ?? null,
        hiddenLibraryAffirmations: saved.hiddenLibraryAffirmations || [],
        dismissedPrompts: saved.dismissedPrompts || [],
        dailyReminderHour: saved.dailyReminderHour ?? null,
        favoriteImageByTheme: saved.favoriteImageByTheme || {},
      });
    }
  },

  persist: () => {
    const s = get();
    const data: PersistedState = {
      selectedTheme: s.selectedTheme,
      selectedDuration: s.selectedDuration,
      sessionHistory: s.sessionHistory,
      customAffirmations: s.customAffirmations,
      userPhotos: s.userPhotos,
      hasLaunched: s.hasLaunched,
      sessionCount: s.sessionCount,
      currentStreak: s.currentStreak,
      lastSessionDate: s.lastSessionDate,
      streakFreezeAvailable: s.streakFreezeAvailable,
      freezeGrantedMonth: s.freezeGrantedMonth,
      hiddenLibraryAffirmations: s.hiddenLibraryAffirmations,
      dismissedPrompts: s.dismissedPrompts,
      dailyReminderHour: s.dailyReminderHour,
      favoriteImageByTheme: s.favoriteImageByTheme,
      version: 2,
    };
    saveState(data).catch(() => {});
  },
}));
