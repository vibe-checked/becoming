import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES, ALL_THEME_IDS } from '../core/themes';
import { DurationMin, ThemeId } from '../core/types';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 14;
const CARD_W = (SCREEN_W - 40 - CARD_GAP) / 2;
const CARD_H = CARD_W * 1.15;

const DURATIONS: DurationMin[] = [3, 5, 10, 15];

export function ThemePicker() {
  const insets = useSafeAreaInsets();
  const selectedTheme = useAppStore((s) => s.selectedTheme);
  const selectedDuration = useAppStore((s) => s.selectedDuration);
  const selectTheme = useAppStore((s) => s.selectTheme);
  const selectDuration = useAppStore((s) => s.selectDuration);
  const startSession = useAppStore((s) => s.startSession);

  const handleThemeTap = (id: ThemeId) => {
    selectTheme(id);
    startSession();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>Becoming</Text>
      <Text style={styles.subtitle}>Choose your focus</Text>

      <View style={styles.durationRow}>
        {DURATIONS.map((d) => (
          <Pressable
            key={d}
            onPress={() => selectDuration(d)}
            style={[
              styles.durationChip,
              selectedDuration === d && styles.durationChipActive,
            ]}
          >
            <Text
              style={[
                styles.durationText,
                selectedDuration === d && styles.durationTextActive,
              ]}
            >
              {d} min
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {ALL_THEME_IDS.map((id) => {
          const theme = THEMES[id];
          const grad = theme.gradients[0];
          return (
            <Pressable
              key={id}
              onPress={() => handleThemeTap(id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <LinearGradient
                colors={[...grad.colors]}
                start={grad.start}
                end={grad.end}
                style={styles.cardGradient}
              >
                <Text style={styles.cardEmoji}>{theme.emoji}</Text>
                <Text style={[styles.cardLabel, { color: theme.palette.text }]}>
                  {theme.label}
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '200',
    color: '#f0f0f5',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  durationChipActive: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  durationTextActive: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    paddingBottom: 40,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  cardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
