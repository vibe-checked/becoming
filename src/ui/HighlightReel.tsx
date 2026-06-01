import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { THEMES } from '../core/themes';
import { Favorite } from '../core/types';

type Props = {
  onClose: () => void;
};

export function HighlightReel({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const favorites = useAppStore((s) => s.favorites);
  const removeFavorite = useAppStore((s) => s.removeFavorite);

  const cardW = screenW - 48;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Highlight Reel</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💫</Text>
          <Text style={styles.emptyText}>
            Tap Resonance during a session to save affirmations you connect with.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {favorites.map((fav) => (
            <FavoriteCard
              key={fav.id}
              favorite={fav}
              width={cardW}
              onRemove={() => removeFavorite(fav.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function FavoriteCard({
  favorite,
  width,
  onRemove,
}: {
  favorite: Favorite;
  width: number;
  onRemove: () => void;
}) {
  const theme = THEMES[favorite.themeId];
  const grad =
    theme.gradients[favorite.gradientIndex % theme.gradients.length];

  return (
    <View style={[styles.card, { width }]}>
      <LinearGradient
        colors={[...grad.colors]}
        start={grad.start}
        end={grad.end}
        style={styles.cardGradient}
      >
        <Text style={styles.cardTheme}>
          {theme.emoji} {theme.label}
        </Text>
        <Text style={styles.cardText}>{favorite.affirmation}</Text>
        <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </LinearGradient>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    color: '#f0f0f5',
    letterSpacing: 1,
  },
  closeText: {
    fontSize: 16,
    color: '#b088e0',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  list: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 24,
    minHeight: 160,
    justifyContent: 'center',
  },
  cardTheme: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  removeBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  removeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
});
