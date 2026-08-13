import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { THEMES, ALL_THEME_IDS } from '../core/themes';
import { ThemeId } from '../core/types';

type Props = {
  onClose: () => void;
  onSelectTheme: (id: ThemeId) => void;
};

export function HighlightReel({ onClose, onSelectTheme }: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const favoriteImageByTheme = useAppStore((s) => s.favoriteImageByTheme);
  const setFavoriteImage = useAppStore((s) => s.setFavoriteImage);

  const cardW = screenW - 48;
  const savedCount = ALL_THEME_IDS.filter((id) => favoriteImageByTheme[id]).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Highlight Reel</Text>
          <Text style={styles.subtitle}>
            {savedCount === 0
              ? 'Your favorite photo from each theme'
              : `${savedCount} of ${ALL_THEME_IDS.length} themes saved`}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {ALL_THEME_IDS.map((id) => (
          <ThemeCard
            key={id}
            themeId={id}
            uri={favoriteImageByTheme[id]}
            width={cardW}
            onPress={() => onSelectTheme(id)}
            onClear={
              favoriteImageByTheme[id]
                ? () => setFavoriteImage(id, favoriteImageByTheme[id]!)
                : undefined
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ThemeCard({
  themeId,
  uri,
  width,
  onPress,
  onClear,
}: {
  themeId: ThemeId;
  uri: string | undefined;
  width: number;
  onPress: () => void;
  onClear?: () => void;
}) {
  const theme = THEMES[themeId];
  const grad = theme.gradients[0];

  return (
    <Pressable onPress={onPress} style={[styles.card, { width }]}>
      {uri ? (
        <>
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardTopRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {theme.emoji} {theme.label}
              </Text>
            </View>
            {onClear && (
              <Pressable onPress={onClear} style={styles.clearBtn} hitSlop={8}>
                <Text style={styles.clearText}>✕</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.cardHint}>Tap to revisit this theme</Text>
        </>
      ) : (
        <>
          <LinearGradient
            colors={[...grad.colors]}
            start={grad.start}
            end={grad.end}
            style={[StyleSheet.absoluteFill, styles.emptyCardGradientBg]}
          />
          <View style={styles.emptyCardContent}>
            <Text style={styles.emptyCardEmoji}>{theme.emoji}</Text>
            <Text style={styles.emptyCardLabel}>{theme.label}</Text>
            <Text style={styles.emptyCardHint}>
              Tap ⭐ Resonance during a {theme.label} session to save a photo here
            </Text>
          </View>
        </>
      )}
    </Pressable>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    color: '#f0f0f5',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#b088e0',
    fontWeight: '600',
    paddingTop: 6,
  },
  list: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardTopRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.3,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  cardHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    padding: 14,
  },
  emptyCardGradientBg: {
    opacity: 0.55,
  },
  emptyCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },
  emptyCardHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
