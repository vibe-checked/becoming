import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import {
  AFFIRMATION_FADE_IN_MS,
  AFFIRMATION_HOLD_MS,
  AFFIRMATION_FADE_OUT_MS,
} from '../core/session';

const { width: W } = Dimensions.get('window');

type Props = {
  text: string;
  visible: boolean;
  ttsEnabled: boolean;
  onDuckAudio?: () => void;
  onRestoreAudio?: () => void;
};

export function AffirmationCard({
  text,
  visible,
  ttsEnabled,
  onDuckAudio,
  onRestoreAudio,
}: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const translateY = useSharedValue(12);
  const prevTextRef = useRef('');

  useEffect(() => {
    if (visible && text !== prevTextRef.current) {
      prevTextRef.current = text;

      opacity.value = 0;
      scale.value = 0.95;
      translateY.value = 12;

      opacity.value = withTiming(1, {
        duration: AFFIRMATION_FADE_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: AFFIRMATION_FADE_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: AFFIRMATION_FADE_IN_MS,
        easing: Easing.out(Easing.cubic),
      });

      const fadeOutDelay = AFFIRMATION_FADE_IN_MS + AFFIRMATION_HOLD_MS;
      opacity.value = withDelay(
        fadeOutDelay,
        withTiming(0, {
          duration: AFFIRMATION_FADE_OUT_MS,
          easing: Easing.in(Easing.cubic),
        }),
      );

      if (ttsEnabled) {
        onDuckAudio?.();
        Speech.speak(text, {
          language: 'en-US',
          rate: 0.85,
          pitch: 1.0,
          onDone: () => onRestoreAudio?.(),
          onStopped: () => onRestoreAudio?.(),
          onError: () => onRestoreAudio?.(),
        });
      }
    }

    if (!visible) {
      opacity.value = 0;
    }

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      cancelAnimation(translateY);
    };
  }, [visible, text, ttsEnabled, opacity, scale, translateY, onDuckAudio, onRestoreAudio]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: W * 0.075,
    right: W * 0.075,
    top: '38%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.3,
  },
});
