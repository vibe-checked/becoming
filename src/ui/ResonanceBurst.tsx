import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { CROSSFADE_MS } from '../core/session';

type Props = {
  onDone: () => void;
};

// Fade in/out split the same way CrossFadeView splits its own crossfade —
// same easing curve (Easing.inOut(Easing.ease)), and the two legs still sum
// to CROSSFADE_MS so the star finishes fading out exactly as the next photo
// finishes fading in, instead of using an unrelated pop/bounce animation.
const FADE_IN_MS = CROSSFADE_MS * 0.35;
const FADE_OUT_MS = CROSSFADE_MS - FADE_IN_MS;

// A single transient star that crossfades in/out and floats up — fired once
// per Resonance tap (Tinder-Super-Like style), independent of the button.
export function ResonanceBurst({ onDone }: Props) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: CROSSFADE_MS, easing: Easing.inOut(Easing.ease) });
    translateY.value = withTiming(-90, { duration: CROSSFADE_MS, easing: Easing.out(Easing.cubic) });
    opacity.value = withSequence(
      withTiming(1, { duration: FADE_IN_MS, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: FADE_OUT_MS, easing: Easing.inOut(Easing.ease) }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.star, style]} pointerEvents="none">
      💫
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
