import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AUTO_HIDE_MS = 8000;
const FADE_MS = 400;

type Props = {
  muted: boolean;
  isFavorited: boolean;
  onMuteToggle: () => void;
  onSkip: () => void;
  onResonance: () => void;
};

export function SessionControls({
  muted,
  isFavorited,
  onMuteToggle,
  onSkip,
  onResonance,
}: Props) {
  const opacity = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, { duration: FADE_MS, easing: Easing.out(Easing.ease) });
    }, AUTO_HIDE_MS);
  }, [opacity]);

  const show = useCallback(() => {
    opacity.value = withTiming(1, { duration: FADE_MS, easing: Easing.out(Easing.ease) });
    scheduleHide();
  }, [opacity, scheduleHide]);

  useEffect(() => {
    scheduleHide();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleHide]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePress = (fn: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
    show();
  };

  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={show} />
      <Animated.View style={[styles.bar, animStyle]} pointerEvents="box-none">
        <Pressable
          onPress={() => handlePress(onResonance)}
          style={[styles.btn, isFavorited && styles.btnActive]}
        >
          <Text style={styles.btnIcon}>{isFavorited ? '⭐' : '💫'}</Text>
          <Text style={styles.btnLabel}>Resonance</Text>
        </Pressable>

        <Pressable onPress={() => handlePress(onSkip)} style={styles.btn}>
          <Text style={styles.btnIcon}>⏭️</Text>
          <Text style={styles.btnLabel}>Skip</Text>
        </Pressable>

        <Pressable
          onPress={() => handlePress(onMuteToggle)}
          style={[styles.btn, muted && styles.btnActive]}
        >
          <Text style={styles.btnIcon}>{muted ? '🔇' : '🔊'}</Text>
          <Text style={styles.btnLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  btn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    minWidth: 80,
  },
  btnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  btnIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  btnLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
