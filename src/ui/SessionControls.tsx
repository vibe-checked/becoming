import React, { useEffect, useRef, useCallback, useState } from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ResonanceBurst } from './ResonanceBurst';
import { useAppStore } from '../store/useAppStore';

const AUTO_HIDE_MS = 8000;
const FADE_MS = 400;

type Props = {
  muted: boolean;
  isFavorited: boolean;
  speedMultiplier: number;
  onMuteToggle: () => void;
  onSkip: () => void;
  onResonance: () => void;
  onSpeedCycle: () => void;
  onShare: () => void;
  tapSignal: number;
};

export function SessionControls({
  muted,
  isFavorited,
  speedMultiplier,
  onMuteToggle,
  onSkip,
  onResonance,
  onSpeedCycle,
  onShare,
  tapSignal,
}: Props) {
  const accentColor = useAppStore((s) => s.accentColor);
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

  useEffect(() => {
    show();
  }, [tapSignal, show]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePress = (fn: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
    show();
  };

  const [bursts, setBursts] = useState<number[]>([]);
  const burstIdRef = useRef(0);

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b !== id));
  }, []);

  const handleResonancePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onResonance();
    show();
    const id = burstIdRef.current++;
    setBursts((prev) => [...prev, id]);
  };

  return (
    <Animated.View style={[styles.bar, animStyle]} pointerEvents="box-none">
      <View style={styles.btnWrapper}>
        {bursts.map((id) => (
          <ResonanceBurst key={id} onDone={() => removeBurst(id)} />
        ))}
        <Pressable
          onPress={handleResonancePress}
          style={[
            styles.btn,
            isFavorited && [styles.btnActive, { borderColor: accentColor, backgroundColor: `${accentColor}2e` }],
          ]}
        >
          <Text style={styles.btnIcon}>{isFavorited ? '⭐' : '💫'}</Text>
          <Text style={[styles.btnLabel, isFavorited && { color: accentColor }]}>Resonance</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => handlePress(onSkip)} style={styles.btn}>
        <Text style={styles.btnIcon}>⏭️</Text>
        <Text style={styles.btnLabel}>Skip</Text>
      </Pressable>

      <Pressable
        onPress={() => handlePress(onSpeedCycle)}
        style={[
          styles.btn,
          speedMultiplier !== 1 && [styles.btnActive, { borderColor: accentColor, backgroundColor: `${accentColor}2e` }],
        ]}
      >
        <Text style={styles.btnIcon}>⚡</Text>
        <Text style={[styles.btnLabel, speedMultiplier !== 1 && { color: accentColor }]}>
          {speedMultiplier}x
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handlePress(onMuteToggle)}
        style={[
          styles.btn,
          muted && [styles.btnActive, { borderColor: accentColor, backgroundColor: `${accentColor}2e` }],
        ]}
      >
        <Text style={styles.btnIcon}>{muted ? '🔇' : '🔊'}</Text>
        <Text style={[styles.btnLabel, muted && { color: accentColor }]}>
          {muted ? 'Unmute' : 'Mute'}
        </Text>
      </Pressable>

      <Pressable onPress={() => handlePress(onShare)} style={styles.btn}>
        <Text style={styles.btnIcon}>📤</Text>
        <Text style={styles.btnLabel}>Share</Text>
      </Pressable>
    </Animated.View>
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
    gap: 8,
  },
  btnWrapper: {
    position: 'relative',
  },
  btn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    minWidth: 60,
  },
  btnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
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
