import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES, ALL_THEME_IDS } from '../core/themes';
import { DurationMin, ThemeId } from '../core/types';
import { useAppStore } from '../store/useAppStore';
import { CustomAffirmationsModal } from './CustomAffirmationsModal';

type Props = {
  onOpenHighlightReel: () => void;
};

const DURATIONS: DurationMin[] = [3, 5, 10, 15];
const CARD_GAP = 12;
const H_PAD = 20;

export function ThemePicker({ onOpenHighlightReel }: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const selectTheme = useAppStore((s) => s.selectTheme);
  const selectedDuration = useAppStore((s) => s.selectedDuration);
  const selectDuration = useAppStore((s) => s.selectDuration);
  const startSession = useAppStore((s) => s.startSession);
  const customAffirmations = useAppStore((s) => s.customAffirmations);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const sessionCount = useAppStore((s) => s.sessionCount);

  const [editTheme, setEditTheme] = useState<ThemeId | null>(null);

  const cardW = (screenW - H_PAD * 2 - CARD_GAP) / 2;
  const cardH = cardW * 1.12;

  const handleThemeTap = (id: ThemeId) => {
    selectTheme(id);
    startSession();
  };

  const rows: ThemeId[][] = [];
  for (let i = 0; i < ALL_THEME_IDS.length; i += 2) {
    rows.push(ALL_THEME_IDS.slice(i, i + 2));
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.titleRow}>
        <View style={styles.titleSpacer} />
        <Text style={styles.title}>Becoming</Text>
        <Pressable onPress={onOpenHighlightReel} hitSlop={8} style={styles.titleSpacer}>
          <Text style={styles.reelBtn}>💫</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>
        {currentStreak > 1
          ? `🔥 ${currentStreak} day streak · ${sessionCount} sessions`
          : sessionCount > 0
            ? `${sessionCount} session${sessionCount === 1 ? '' : 's'} completed`
            : 'Choose your focus · long press to customize'}
      </Text>

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
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, ri) => (
          <View key={ri} style={[styles.row, { gap: CARD_GAP, marginBottom: CARD_GAP }]}>
            {row.map((id) => {
              const theme = THEMES[id];
              const grad = theme.gradients[0];
              const hasCustom = customAffirmations.some((a) => a.themeId === id);
              return (
                <Pressable
                  key={id}
                  onPress={() => handleThemeTap(id)}
                  onLongPress={() => setEditTheme(id)}
                  delayLongPress={400}
                  style={({ pressed }) => [
                    { width: cardW, height: cardH, borderRadius: 18, overflow: 'hidden' as const },
                    pressed && styles.cardPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[...grad.colors]}
                    start={grad.start}
                    end={grad.end}
                    style={styles.cardGradient}
                  >
                    {hasCustom && <Text style={styles.customBadge}>✏️</Text>}
                    <Text style={styles.cardEmoji}>{theme.emoji}</Text>
                    <Text style={[styles.cardLabel, { color: theme.palette.text }]}>
                      {theme.label}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {editTheme && (
        <CustomAffirmationsModal
          visible={true}
          themeId={editTheme}
          onClose={() => setEditTheme(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    paddingHorizontal: H_PAD,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSpacer: {
    width: 40,
    alignItems: 'center',
  },
  reelBtn: {
    fontSize: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '200',
    color: '#f0f0f5',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
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
  gridContainer: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
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
  customBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 14,
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
