import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Speech from 'expo-speech';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { THEMES } from '../core/themes';
import { getShuffledAffirmations } from '../core/affirmations';
import {
  computeAffirmationState,
  isSessionComplete,
  AFFIRMATION_INTERVAL_MS,
  AFFIRMATION_TOTAL_MS,
} from '../core/session';
import { CrossFadeView } from './CrossFadeView';
import { SessionCountdown } from './SessionCountdown';
import { AffirmationCard } from './AffirmationCard';
import { SessionControls } from './SessionControls';

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
  const addFavorite = useAppStore((s) => s.addFavorite);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const favorites = useAppStore((s) => s.favorites);
  const customAffirmations = useAppStore((s) => s.customAffirmations);

  const theme = THEMES[selectedTheme];
  const durationMs = selectedDuration * 60 * 1000;

  const soundRef = useRef<Audio.Sound | null>(null);
  const affirmationsRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [affirmationText, setAffirmationText] = useState('');
  const [affirmationVisible, setAffirmationVisible] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const lastAffIndexRef = useRef(-1);
  const affIndexRef = useRef(0);
  const skipOffsetRef = useRef(0);

  useEffect(() => {
    const custom = customAffirmations
      .filter((a) => a.themeId === selectedTheme)
      .map((a) => a.text);
    const library = getShuffledAffirmations(selectedTheme);
    affirmationsRef.current = [...custom, ...library];
  }, [selectedTheme, customAffirmations]);

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
      } catch {}
    })();

    return () => {
      mounted = false;
      Speech.stop();
      const s = soundRef.current;
      soundRef.current = null;
      s?.stopAsync().then(() => s.unloadAsync());
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
        const s = soundRef.current;
        soundRef.current = null;
        s?.setVolumeAsync(0).then(() => s?.stopAsync());
        endSession();
        return;
      }

      const adjustedElapsed = elapsed + skipOffsetRef.current;
      const affState = computeAffirmationState(
        adjustedElapsed,
        affirmationsRef.current.length,
      );

      if (affState.visible && affState.index !== lastAffIndexRef.current) {
        lastAffIndexRef.current = affState.index;
        affIndexRef.current = affState.index;
        setAffirmationText(affirmationsRef.current[affState.index]);
        setAffirmationVisible(true);
        setCurrentGradientIndex(
          Math.floor(adjustedElapsed / 4000) % theme.gradients.length,
        );
      } else if (!affState.visible && lastAffIndexRef.current >= 0) {
        setAffirmationVisible(false);
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionStartedAt, durationMs, endSession, theme.gradients.length]);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    Speech.stop();
    const s = soundRef.current;
    soundRef.current = null;
    s?.stopAsync().then(() => s.unloadAsync());
    endSession();
  };

  const handleMuteToggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (next) {
        Speech.stop();
        soundRef.current?.setVolumeAsync(0);
      } else {
        soundRef.current?.setVolumeAsync(MUSIC_VOLUME);
      }
      return next;
    });
  }, []);

  const handleSkip = useCallback(() => {
    Speech.stop();
    skipOffsetRef.current += AFFIRMATION_INTERVAL_MS;
    lastAffIndexRef.current = -1;
    setAffirmationVisible(false);
  }, []);

  const handleResonance = useCallback(() => {
    if (!affirmationText) return;
    const existing = favorites.find(
      (f) => f.themeId === selectedTheme && f.affirmation === affirmationText,
    );
    if (existing) {
      removeFavorite(existing.id);
    } else {
      addFavorite({
        themeId: selectedTheme,
        affirmation: affirmationText,
        gradientIndex: currentGradientIndex,
      });
    }
  }, [affirmationText, selectedTheme, currentGradientIndex, favorites, addFavorite, removeFavorite]);

  const isFav = favorites.some(
    (f) => f.themeId === selectedTheme && f.affirmation === affirmationText,
  );

  return (
    <View style={styles.root}>
      <CrossFadeView gradients={theme.gradients} running={true} />

      <SessionCountdown remainingMs={remainingMs} />

      <AffirmationCard
        text={affirmationText}
        visible={affirmationVisible}
        ttsEnabled={!muted}
        onDuckAudio={muted ? undefined : handleDuck}
        onRestoreAudio={muted ? undefined : handleRestore}
      />

      <SessionControls
        muted={muted}
        isFavorited={isFav}
        onMuteToggle={handleMuteToggle}
        onSkip={handleSkip}
        onResonance={handleResonance}
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
