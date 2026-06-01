import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedState } from './types';

const KEY = 'becoming:state:v2';
const OLD_KEY = 'becoming:state:v1';

export async function saveState(s: PersistedState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

export async function loadState(): Promise<PersistedState | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 2) return parsed as PersistedState;
    } catch {}
  }

  const oldRaw = await AsyncStorage.getItem(OLD_KEY);
  if (oldRaw) {
    try {
      const old = JSON.parse(oldRaw);
      if (old && old.version === 1) {
        const migrated: PersistedState = {
          selectedTheme: old.selectedTheme,
          selectedDuration: old.selectedDuration,
          sessionHistory: old.sessionHistory || [],
          favorites: [],
          customAffirmations: [],
          userPhotos: [],
          hasLaunched: old.hasLaunched,
          sessionCount: old.sessionHistory?.length || 0,
          currentStreak: 0,
          lastSessionDate: null,
          dismissedPrompts: [],
          dailyReminderHour: null,
          version: 2,
        };
        await saveState(migrated);
        await AsyncStorage.removeItem(OLD_KEY);
        return migrated;
      }
    } catch {}
  }

  return null;
}
