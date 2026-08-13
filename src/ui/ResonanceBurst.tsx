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

type Props = {
  onDone: () => void;
};

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
    translateY.value = withTiming(-90, { duration: 900, easing: Easing.out(Easing.cubic) });
    opacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withDelay(
        480,
        withTiming(0, { duration: 300 }, (finished) => {
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
