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
  skipSignal?: number;
  onActiveSourceChange?: (source: VisualSource) => void;
  speedMultiplier?: number;
};

function VisualSlot({
  source,
  active,
  speedMultiplier,
}: {
  source: VisualSource;
  active: boolean;
  speedMultiplier: number;
}) {
  if (source.type === 'photo') {
    return <KenBurnsImage uri={source.uri} active={active} speedMultiplier={speedMultiplier} />;
  }
  return <KenBurnsView gradient={source.gradient} active={active} speedMultiplier={speedMultiplier} />;
}

export function CrossFadeView({
  sources,
  running,
  skipSignal,
  onActiveSourceChange,
  speedMultiplier = 1,
}: Props) {
  const [slotA, setSlotA] = useState(0);
  const [slotB, setSlotB] = useState(Math.min(1, sources.length - 1));
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const opacityB = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const lastSkipSignalRef = useRef(skipSignal ?? 0);

  const advanceToNext = useCallback(() => {
    if (sources.length <= 1) return;
    const nextIdx = (indexRef.current + 1) % sources.length;
    indexRef.current = nextIdx;

    const crossfadeMs = CROSSFADE_MS / speedMultiplier;

    if (activeSlot === 'A') {
      setSlotB(nextIdx);
      opacityB.value = 0;
      opacityB.value = withTiming(1, {
        duration: crossfadeMs,
        easing: Easing.inOut(Easing.ease),
      }, (finished) => {
        if (finished) runOnJS(setActiveSlot)('B');
      });
    } else {
      setSlotA(nextIdx);
      opacityB.value = 1;
      opacityB.value = withTiming(0, {
        duration: crossfadeMs,
        easing: Easing.inOut(Easing.ease),
      }, (finished) => {
        if (finished) runOnJS(setActiveSlot)('A');
      });
    }
  }, [sources.length, activeSlot, opacityB, speedMultiplier]);

  const scheduleNext = useCallback(() => {
    if (!running || sources.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(advanceToNext, (IMAGE_DURATION_MS - CROSSFADE_MS) / speedMultiplier);
  }, [running, sources.length, advanceToNext, speedMultiplier]);

  useEffect(() => {
    if (running) {
      scheduleNext();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, activeSlot, scheduleNext]);

  useEffect(() => {
    // advanceToNext's identity changes every time activeSlot flips (a normal,
    // non-skip transition), which would re-run this effect and double-advance
    // unless we only react to skipSignal actually increasing.
    if (skipSignal !== undefined && skipSignal > lastSkipSignalRef.current) {
      lastSkipSignalRef.current = skipSignal;
      if (timerRef.current) clearTimeout(timerRef.current);
      advanceToNext();
    }
  }, [skipSignal, advanceToNext]);

  useEffect(() => {
    if (sources.length === 0) return;
    const activeIndex = activeSlot === 'A' ? slotA : slotB;
    onActiveSourceChange?.(sources[activeIndex % sources.length]);
  }, [activeSlot, slotA, slotB, sources, onActiveSourceChange]);

  const animStyleB = useAnimatedStyle(() => ({
    opacity: opacityB.value,
  }));

  if (sources.length === 0) return <View style={styles.container} />;

  const srcA = sources[slotA % sources.length];
  const srcB = sources[slotB % sources.length];

  return (
    <View style={styles.container}>
      <VisualSlot source={srcA} active={running && activeSlot === 'A'} speedMultiplier={speedMultiplier} />
      <Animated.View style={[styles.overlay, animStyleB]}>
        <VisualSlot source={srcB} active={running && activeSlot === 'B'} speedMultiplier={speedMultiplier} />
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
