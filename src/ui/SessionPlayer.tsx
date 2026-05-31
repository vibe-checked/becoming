import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Speech from 'expo-speech';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { THEMES } from '../core/themes';
import { getShuffledAffirmations } from '../core/affirmations';
import { computeAffirmationState, isSessionComplete } from '../core/session';
import { CrossFadeView } from './CrossFadeView';
import { SessionCountdown } from './SessionCountdown';
import { AffirmationCard } from './AffirmationCard';

const TICK_MS = 50;
const MUSIC_VOLUME = 0.5;
const MUSIC_DUCK_VOLUME = 0.2;

export function SessionPlayer() {
  useKeepAwake();
  const insets = useSafeAreaInsets();

  const selectedTheme = useAppStore((s) => s.selectedTheme);
  const selectedDuration = useAppStore((s) => s.selectedDuration);
  const sessionStartedAt = useAppStore((s) => s.sessionStartedAt);
  const endSession = useAppStore((s) => s.endSession);

  const theme = THEMES[selectedTheme];
  const durationMs = selectedDuration * 60 * 1000;

  const soundRef = useRef<Audio.Sound | null>(null);
  const affirmationsRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [affirmationText, setAffirmationText] = useState('');
  const [affirmationVisible, setAffirmationVisible] = useState(false);
  const lastAffIndexRef = useRef(-1);

  useEffect(() => {
    affirmationsRef.current = getShuffledAffirmations(selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/music/ambient.mp3'),
          { shouldPlay: true, isLooping: true, volume: MUSIC_VOLUME },
        );
        if (mounted) {
          soundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch {
        // audio may not be available in simulator
      }
    })();

    return () => {
      mounted = false;
      Speech.stop();
      soundRef.current?.stopAsync().then(() => soundRef.current?.unloadAsync());
      soundRef.current = null;
    };
  }, []);

  const handleDuck = useCallback(() => {
    soundRef.current?.setVolumeAsync(MUSIC_DUCK_VOLUME);
  }, []);

  const handleRestore = useCallback(() => {
    soundRef.current?.setVolumeAsync(MUSIC_VOLUME);
  }, []);

  useEffect(() => {
    if (!sessionStartedAt) return;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - sessionStartedAt;
      const remaining = Math.max(0, durationMs - elapsed);
      setRemainingMs(remaining);

      if (isSessionComplete(elapsed, durationMs)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        Speech.stop();
        soundRef.current
          ?.setVolumeAsync(0)
          .then(() => soundRef.current?.stopAsync());
        endSession();
        return;
      }

      const affState = computeAffirmationState(
        elapsed,
        affirmationsRef.current.length,
      );

      if (affState.visible && affState.index !== lastAffIndexRef.current) {
        lastAffIndexRef.current = affState.index;
        setAffirmationText(affirmationsRef.current[affState.index]);
        setAffirmationVisible(true);
      } else if (!affState.visible && lastAffIndexRef.current >= 0) {
        setAffirmationVisible(false);
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionStartedAt, durationMs, endSession]);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    Speech.stop();
    soundRef.current?.stopAsync().then(() => soundRef.current?.unloadAsync());
    soundRef.current = null;
    endSession();
  };

  return (
    <View style={styles.root}>
      <CrossFadeView gradients={theme.gradients} running={true} />

      <SessionCountdown remainingMs={remainingMs} />

      <AffirmationCard
        text={affirmationText}
        visible={affirmationVisible}
        ttsEnabled={true}
        onDuckAudio={handleDuck}
        onRestoreAudio={handleRestore}
      />

      <Pressable
        onPress={handleStop}
        style={[styles.stopBtn, { top: insets.top + 12 }]}
        hitSlop={12}
      >
        <Text style={styles.stopText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stopBtn: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
});
