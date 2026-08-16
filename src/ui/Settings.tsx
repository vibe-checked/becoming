import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { THEMES, ALL_THEME_IDS } from '../core/themes';
import { ACCENT_COLORS } from '../core/accentColors';

type Props = {
  onClose: () => void;
};

export function Settings({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const resonatedPhotosByTheme = useAppStore((s) => s.resonatedPhotosByTheme);
  const resetResonatedPhotos = useAppStore((s) => s.resetResonatedPhotos);
  const accentColor = useAppStore((s) => s.accentColor);
  const setAccentColor = useAppStore((s) => s.setAccentColor);

  const handleReset = (themeId: (typeof ALL_THEME_IDS)[number], label: string) => {
    Alert.alert(
      `Reset ${label}?`,
      'This clears every photo you’ve resonated with in this theme. Future sessions will start fresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetResonatedPhotos(themeId),
        },
      ],
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={[styles.doneText, { color: accentColor }]}>Done</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.swatchRow}>
        {ACCENT_COLORS.map((c) => (
          <Pressable
            key={c.color}
            onPress={() => setAccentColor(c.color)}
            style={[styles.swatch, { backgroundColor: c.color }]}
            hitSlop={4}
          >
            {accentColor === c.color && <Text style={styles.swatchCheck}>✓</Text>}
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Resonated Photos</Text>
      <Text style={styles.sectionHint}>
        Reset a theme to clear its saved photos and start resonating from scratch.
      </Text>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {ALL_THEME_IDS.map((id) => {
          const theme = THEMES[id];
          const count = resonatedPhotosByTheme[id]?.length ?? 0;
          return (
            <View key={id} style={styles.row}>
              <Text style={styles.rowEmoji}>{theme.emoji}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{theme.label}</Text>
                <Text style={styles.rowMeta}>
                  {count === 0 ? 'No photos resonated yet' : `${count} photo${count === 1 ? '' : 's'} resonated`}
                </Text>
              </View>
              <Pressable
                onPress={() => handleReset(id, theme.label)}
                disabled={count === 0}
                style={[styles.resetBtn, count === 0 && styles.resetBtnDisabled]}
              >
                <Text style={[styles.resetText, count === 0 && styles.resetTextDisabled]}>
                  Reset
                </Text>
              </Pressable>
            </View>
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
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    color: '#f0f0f5',
    letterSpacing: 1,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    paddingTop: 6,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a12',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#777',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionHint: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 18,
  },
  list: {
    gap: 10,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#14141d',
    borderRadius: 16,
    padding: 14,
  },
  rowEmoji: {
    fontSize: 26,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e8e8ee',
    marginBottom: 2,
  },
  rowMeta: {
    fontSize: 12,
    color: '#777',
  },
  resetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d4637a',
  },
  resetBtnDisabled: {
    borderColor: '#2a2a35',
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d4637a',
  },
  resetTextDisabled: {
    color: '#444',
  },
});
