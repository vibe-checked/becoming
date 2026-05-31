import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { KenBurnsView } from './KenBurnsView';
import { GradientCombo } from '../core/types';
import { IMAGE_DURATION_MS, CROSSFADE_MS } from '../core/session';

type Props = {
  gradients: readonly GradientCombo[];
  running: boolean;
};

export function CrossFadeView({ gradients, running }: Props) {
  const [slotA, setSlotA] = useState(0);
  const [slotB, setSlotB] = useState(1 % gradients.length);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const opacityB = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  const scheduleNext = useCallback(() => {
    if (!running) return;
    timerRef.current = setTimeout(() => {
      const nextIdx = (indexRef.current + 1) % gradients.length;
      indexRef.current = nextIdx;

      if (activeSlot === 'A') {
        setSlotB(nextIdx);
        opacityB.value = 0;
        opacityB.value = withTiming(1, {
          duration: CROSSFADE_MS,
          easing: Easing.inOut(Easing.ease),
        }, (finished) => {
          if (finished) runOnJS(setActiveSlot)('B');
        });
      } else {
        setSlotA(nextIdx);
        opacityB.value = 1;
        opacityB.value = withTiming(0, {
          duration: CROSSFADE_MS,
          easing: Easing.inOut(Easing.ease),
        }, (finished) => {
          if (finished) runOnJS(setActiveSlot)('A');
        });
      }
    }, IMAGE_DURATION_MS - CROSSFADE_MS);
  }, [running, gradients.length, activeSlot, opacityB]);

  useEffect(() => {
    if (running) {
      scheduleNext();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, activeSlot, scheduleNext]);

  const animStyleB = useAnimatedStyle(() => ({
    opacity: opacityB.value,
  }));

  const gradA = gradients[slotA % gradients.length];
  const gradB = gradients[slotB % gradients.length];

  return (
    <View style={styles.container}>
      <KenBurnsView gradient={gradA} active={running && activeSlot === 'A'} />
      <Animated.View style={[styles.overlay, animStyleB]}>
        <KenBurnsView gradient={gradB} active={running && activeSlot === 'B'} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});
