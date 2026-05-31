import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedState } from './types';

const KEY = 'becoming:state:v1';

export async function saveState(s: PersistedState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

export async function loadState(): Promise<PersistedState | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) return parsed as PersistedState;
    return null;
  } catch {
    return null;
  }
}
