import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { CROSSFADE_MS } from '../core/session';

type Props = {
  onDone: () => void;
};

const FADE_IN_MS = 120;
const FADE_OUT_MS = 300;
// The star's total on-screen lifetime is pinned to CROSSFADE_MS so it fades
// out exactly as the next photo finishes crossfading in, instead of the two
// durations drifting apart as independent hardcoded numbers.
const HOLD_MS = CROSSFADE_MS - FADE_IN_MS - FADE_OUT_MS;

// A single transient star that pops, floats up, and fades — fired once per
// Resonance tap (Tinder-Super-Like style), independent of the button itself.
export function ResonanceBurst({ onDone }: Props) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 180, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 140, easing: Easing.out(Easing.ease) }),
    );
    translateY.value = withTiming(-90, { duration: CROSSFADE_MS, easing: Easing.out(Easing.cubic) });
    opacity.value = withSequence(
      withTiming(1, { duration: FADE_IN_MS }),
      withDelay(
        HOLD_MS,
        withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
          if (finished) runOnJS(onDone)();
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.star, style]} pointerEvents="none">
      ⭐
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    fontSize: 30,
  },
});
