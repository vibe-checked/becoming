import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedState } from './types';
import { DEFAULT_ACCENT_COLOR } from './accentColors';

const KEY = 'becoming:state:v3';
const V2_KEY = 'becoming:state:v2';
const V1_KEY = 'becoming:state:v1';

export async function saveState(s: PersistedState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

export async function loadState(): Promise<PersistedState | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 3) return parsed as PersistedState;
    } catch {}
  }

  const v2Raw = await AsyncStorage.getItem(V2_KEY);
  if (v2Raw) {
    try {
      const v2 = JSON.parse(v2Raw);
      if (v2 && v2.version === 2) {
        const migrated: PersistedState = {
          selectedTheme: v2.selectedTheme,
          selectedDuration: v2.selectedDuration,
          sessionHistory: v2.sessionHistory || [],
          customAffirmations: v2.customAffirmations || [],
          userPhotos: v2.userPhotos || [],
          hasLaunched: v2.hasLaunched,
          sessionCount: v2.sessionCount || 0,
          currentStreak: v2.currentStreak || 0,
          lastSessionDate: v2.lastSessionDate ?? null,
          streakFreezeAvailable: v2.streakFreezeAvailable ?? false,
          freezeGrantedMonth: v2.freezeGrantedMonth ?? null,
          hiddenLibraryAffirmations: v2.hiddenLibraryAffirmations || [],
          dismissedPrompts: v2.dismissedPrompts || [],
          dailyReminderHour: v2.dailyReminderHour ?? null,
          // A single resonated photo per theme becomes that theme's one-item
          // resonated list, so existing favorites carry over as the first
          // (most-recently-resonated) entry rather than being dropped.
          resonatedPhotosByTheme: Object.fromEntries(
            Object.entries(v2.favoriteImageByTheme || {}).map(([themeId, uri]) => [
              themeId,
              [uri],
            ]),
          ),
          accentColor: DEFAULT_ACCENT_COLOR,
          version: 3,
        };
        await saveState(migrated);
        await AsyncStorage.removeItem(V2_KEY);
        return migrated;
      }
    } catch {}
  }

  const v1Raw = await AsyncStorage.getItem(V1_KEY);
  if (v1Raw) {
    try {
      const v1 = JSON.parse(v1Raw);
      if (v1 && v1.version === 1) {
        const migrated: PersistedState = {
          selectedTheme: v1.selectedTheme,
          selectedDuration: v1.selectedDuration,
          sessionHistory: v1.sessionHistory || [],
          customAffirmations: [],
          userPhotos: [],
          hasLaunched: v1.hasLaunched,
          sessionCount: v1.sessionHistory?.length || 0,
          currentStreak: 0,
          lastSessionDate: null,
          streakFreezeAvailable: false,
          freezeGrantedMonth: null,
          hiddenLibraryAffirmations: [],
          dismissedPrompts: [],
          dailyReminderHour: null,
          resonatedPhotosByTheme: {},
          accentColor: DEFAULT_ACCENT_COLOR,
          version: 3,
        };
        await saveState(migrated);
        await AsyncStorage.removeItem(V1_KEY);
        return migrated;
      }
    } catch {}
  }

  return null;
}
