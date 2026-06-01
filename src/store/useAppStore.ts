import { create } from 'zustand';
import {
  DurationMin,
  PersistedState,
  ReflectionEmoji,
  SessionRecord,
  ThemeId,
} from '../core/types';
import { saveState, loadState } from '../core/persistence';

type Store = {
  selectedTheme: ThemeId;
  selectedDuration: DurationMin;
  sessionHistory: SessionRecord[];
  hasLaunched: boolean;

  screen: 'theme_picker' | 'session';
  sessionPhase: 'idle' | 'playing' | 'reflection';
  sessionStartedAt: number | null;

  selectTheme: (id: ThemeId) => void;
  selectDuration: (d: DurationMin) => void;
  startSession: () => void;
  endSession: () => void;
  submitReflection: (emoji: ReflectionEmoji, note: string) => void;
  hydrate: () => Promise<void>;
  persist: () => void;
};

const MAX_HISTORY = 200;

export const useAppStore = create<Store>((set, get) => ({
  selectedTheme: 'rich',
  selectedDuration: 5,
  sessionHistory: [],
  hasLaunched: false,

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
    set({
      sessionHistory: history,
      sessionPhase: 'idle',
      screen: 'theme_picker',
      sessionStartedAt: null,
    });
    get().persist();
  },

  hydrate: async () => {
    const saved = await loadState();
    if (saved) {
      set({
        selectedTheme: saved.selectedTheme,
        selectedDuration: saved.selectedDuration,
        sessionHistory: saved.sessionHistory,
        hasLaunched: saved.hasLaunched,
      });
    }
  },

  persist: () => {
    const s = get();
    const data: PersistedState = {
      selectedTheme: s.selectedTheme,
      selectedDuration: s.selectedDuration,
      sessionHistory: s.sessionHistory,
      hasLaunched: s.hasLaunched,
      version: 1,
    };
    saveState(data);
  },
}));
