import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientCombo } from '../core/types';
import { IMAGE_DURATION_MS } from '../core/session';

const { width: W, height: H } = Dimensions.get('window');
const SCALE_FROM = 1.0;
const SCALE_TO = 1.18;
const PAN_RANGE = 25;

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

function randomPan(): number {
  return (Math.random() - 0.5) * 2 * PAN_RANGE;
}

type Props = {
  gradient: GradientCombo;
  active: boolean;
};

export function KenBurnsView({ gradient, active }: Props) {
  const scale = useSharedValue(SCALE_FROM);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (active) {
      const targetX = randomPan();
      const targetY = randomPan();
      scale.value = SCALE_FROM;
      translateX.value = 0;
      translateY.value = 0;

      scale.value = withTiming(SCALE_TO, {
        duration: IMAGE_DURATION_MS,
        easing: Easing.linear,
      });
      translateX.value = withTiming(targetX, {
        duration: IMAGE_DURATION_MS,
        easing: Easing.linear,
      });
      translateY.value = withTiming(targetY, {
        duration: IMAGE_DURATION_MS,
        easing: Easing.linear,
      });
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(translateX);
      cancelAnimation(translateY);
    };
  }, [active, gradient, scale, translateX, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <AnimatedGradient
      colors={[...gradient.colors]}
      start={gradient.start}
      end={gradient.end}
      style={[styles.gradient, animStyle]}
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    width: W * 1.15,
    height: H * 1.15,
    left: -(W * 0.075),
    top: -(H * 0.075),
  },
});
