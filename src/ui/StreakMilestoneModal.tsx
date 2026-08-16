import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';

const MESSAGES: Record<number, string> = {
  3: 'Three days in a row. A habit is forming.',
  7: 'A full week. You showed up for yourself every day.',
  14: 'Two weeks straight. This is who you are now.',
  30: 'A whole month. That kind of consistency changes people.',
  50: '50 days. Most people never make it this far.',
  100: '100 days. A genuine practice, not a phase.',
  200: '200 days. This is simply part of your life now.',
  365: 'A full year. Extraordinary.',
};

export function StreakMilestoneModal() {
  const justHitMilestone = useAppStore((s) => s.justHitMilestone);
  const clearMilestone = useAppStore((s) => s.clearMilestone);
  const accentColor = useAppStore((s) => s.accentColor);
  const visible = justHitMilestone !== null;

  const scale = useSharedValue(0.6);

  useEffect(() => {
    if (visible) {
      scale.value = 0.6;
      scale.value = withSequence(
        withTiming(1.08, { duration: 260, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 140, easing: Easing.out(Easing.ease) }),
      );
    }
  }, [visible, scale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.fire}>🔥</Text>
          <Text style={styles.title}>{justHitMilestone} Day Streak</Text>
          <Text style={styles.message}>{MESSAGES[justHitMilestone ?? 0]}</Text>
          <Pressable
            onPress={clearMilestone}
            style={[styles.button, { backgroundColor: accentColor }]}
          >
            <Text style={styles.buttonText}>Keep going</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#1a1a24',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  fire: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#f0f0f5',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 15,
    color: '#0a0a12',
    fontWeight: '700',
  },
});
