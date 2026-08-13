import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { IMAGE_DURATION_MS } from '../core/session';

const SCALE_FROM = 1.0;
const SCALE_TO = 1.18;
const PAN_RANGE = 25;

function randomPan(): number {
  return (Math.random() - 0.5) * 2 * PAN_RANGE;
}

type Props = {
  uri: string;
  active: boolean;
  speedMultiplier?: number;
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

export function KenBurnsImage({ uri, active, speedMultiplier = 1 }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const scale = useSharedValue(SCALE_FROM);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // A slot's uri changes while it's still inactive (it's pre-loaded with
    // the next image before the crossfade makes it active), so the reset
    // to the resting frame must happen unconditionally here — otherwise it
    // keeps whichever scale/pan its last active cycle ended at, and jumps
    // to that stale zoomed-in frame the instant it becomes visible.
    cancelAnimation(scale);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    scale.value = SCALE_FROM;
    translateX.value = 0;
    translateY.value = 0;

    if (active) {
      const targetX = randomPan();
      const targetY = randomPan();
      const duration = IMAGE_DURATION_MS / speedMultiplier;

      scale.value = withTiming(SCALE_TO, {
        duration,
        easing: Easing.linear,
      });
      translateX.value = withTiming(targetX, {
        duration,
        easing: Easing.linear,
      });
      translateY.value = withTiming(targetY, {
        duration,
        easing: Easing.linear,
      });
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(translateX);
      cancelAnimation(translateY);
    };
  }, [active, uri, scale, translateX, translateY, speedMultiplier]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <AnimatedImage
      source={{ uri }}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={null}
      style={[
        {
          position: 'absolute' as const,
          width: W * 1.15,
          height: H * 1.15,
          left: -(W * 0.075),
          top: -(H * 0.075),
        },
        animStyle,
      ]}
    />
  );
}
