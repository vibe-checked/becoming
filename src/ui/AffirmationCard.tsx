import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
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
  const { width: screenW } = useWindowDimensions();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const translateY = useSharedValue(12);
  const prevTextRef = useRef('');
  const displayTextRef = useRef('');

  useEffect(() => {
    if (visible && text) {
      if (text !== prevTextRef.current) {
        prevTextRef.current = text;
        displayTextRef.current = text;

        cancelAnimation(opacity);
        cancelAnimation(scale);
        cancelAnimation(translateY);

        scale.value = 0.95;
        translateY.value = 12;

        opacity.value = withSequence(
          withTiming(1, {
            duration: AFFIRMATION_FADE_IN_MS,
            easing: Easing.out(Easing.cubic),
          }),
          withDelay(
            AFFIRMATION_HOLD_MS,
            withTiming(0, {
              duration: AFFIRMATION_FADE_OUT_MS,
              easing: Easing.in(Easing.cubic),
            }),
          ),
        );

        scale.value = withTiming(1, {
          duration: AFFIRMATION_FADE_IN_MS,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(0, {
          duration: AFFIRMATION_FADE_IN_MS,
          easing: Easing.out(Easing.cubic),
        });

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
    }
  }, [visible, text, ttsEnabled, opacity, scale, translateY, onDuckAudio, onRestoreAudio]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const hPad = screenW * 0.075;
  const displayText = displayTextRef.current || text;

  return (
    <Animated.View
      style={[styles.card, { left: hPad, right: hPad }, animStyle]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{displayText}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: '38%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.3,
  },
});
