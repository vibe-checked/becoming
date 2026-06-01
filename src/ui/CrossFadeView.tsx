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
import { KenBurnsImage } from './KenBurnsImage';
import { GradientCombo } from '../core/types';
import { IMAGE_DURATION_MS, CROSSFADE_MS } from '../core/session';

export type VisualSource =
  | { type: 'gradient'; gradient: GradientCombo }
  | { type: 'photo'; uri: string };

type Props = {
  sources: VisualSource[];
  running: boolean;
};

function VisualSlot({ source, active }: { source: VisualSource; active: boolean }) {
  if (source.type === 'photo') {
    return <KenBurnsImage uri={source.uri} active={active} />;
  }
  return <KenBurnsView gradient={source.gradient} active={active} />;
}

export function CrossFadeView({ sources, running }: Props) {
  const safeLen = Math.max(1, sources.length);
  const [slotA, setSlotA] = useState(0);
  const [slotB, setSlotB] = useState(1 % safeLen);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const opacityB = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  const scheduleNext = useCallback(() => {
    if (!running || sources.length <= 1) return;
    timerRef.current = setTimeout(() => {
      const nextIdx = (indexRef.current + 1) % sources.length;
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
  }, [running, sources.length, activeSlot, opacityB]);

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

  if (sources.length === 0) return <View style={styles.container} />;

  const srcA = sources[slotA % sources.length];
  const srcB = sources[slotB % sources.length];

  return (
    <View style={styles.container}>
      <VisualSlot source={srcA} active={running && activeSlot === 'A'} />
      <Animated.View style={[styles.overlay, animStyleB]}>
        <VisualSlot source={srcB} active={running && activeSlot === 'B'} />
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
