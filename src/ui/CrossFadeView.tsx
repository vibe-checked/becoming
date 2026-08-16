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
  // Tracks which slot the NEXT advanceToNext call should target, flipped
  // synchronously on every call. `activeSlot` state only flips once a
  // crossfade completes uninterrupted, so pressing Skip again before that
  // (which rapid taps do) would otherwise re-target the same slot and reset
  // its fade progress to 0 — snapping the other, stale slot briefly back
  // into view instead of advancing forward.
  const nextTargetRef = useRef<'A' | 'B'>('A');

  const advanceToNext = useCallback(() => {
    if (sources.length <= 1) return;
    const nextIdx = (indexRef.current + 1) % sources.length;
    indexRef.current = nextIdx;
    // Report the new source the instant it starts fading in, not when the
    // crossfade finishes — reporting on completion (via activeSlot below)
    // left the favorite star showing the outgoing photo's state for the
    // entire crossfade after the new photo had already begun appearing.
    onActiveSourceChange?.(sources[nextIdx]);

    const crossfadeMs = CROSSFADE_MS / speedMultiplier;
    const target = nextTargetRef.current;
    nextTargetRef.current = target === 'A' ? 'B' : 'A';

    if (target === 'A') {
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
  }, [sources, opacityB, speedMultiplier, onActiveSourceChange]);

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

  // Reports the current source whenever the `sources` array itself changes
  // (initial mount, or photos finishing their async load) — ongoing
  // transitions are instead reported immediately from advanceToNext above,
  // right as each new source starts fading in.
  useEffect(() => {
    if (sources.length === 0) return;
    onActiveSourceChange?.(sources[indexRef.current % sources.length]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources]);

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
