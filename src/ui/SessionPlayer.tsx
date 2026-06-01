import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
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
} from '../core/session';
import { CrossFadeView, VisualSource } from './CrossFadeView';
import { SessionCountdown } from './SessionCountdown';
import { AffirmationCard } from './AffirmationCard';
import { SessionControls } from './SessionControls';
import { fetchThemeImages } from '../core/unsplash';

const TICK_MS = 50;
const MUSIC_VOLUME = 0.5;
const MUSIC_DUCK_VOLUME = 0.2;

const ambientSource = require('../../assets/music/ambient.mp3');

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
  const hiddenLibraryAffirmations = useAppStore((s) => s.hiddenLibraryAffirmations);
  const userPhotos = useAppStore((s) => s.userPhotos);

  const theme = THEMES[selectedTheme];
  const durationMs = selectedDuration * 60 * 1000;

  const [unsplashUris, setUnsplashUris] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchThemeImages(selectedTheme, 5).then((images) => {
      if (!cancelled && images.length > 0) {
        setUnsplashUris(images.map((i) => i.url));
      }
    });
    return () => { cancelled = true; };
  }, [selectedTheme]);

  const visualSources: VisualSource[] = useMemo(() => {
    const gradientSources: VisualSource[] = theme.gradients.map((g) => ({
      type: 'gradient' as const,
      gradient: g,
    }));
    const photoSources: VisualSource[] = userPhotos
      .filter((p) => p.themeId === selectedTheme)
      .map((p) => ({ type: 'photo' as const, uri: p.uri }));
    const unsplashSources: VisualSource[] = unsplashUris.map((uri) => ({
      type: 'photo' as const,
      uri,
    }));
    return [...unsplashSources, ...photoSources, ...gradientSources];
  }, [theme.gradients, userPhotos, selectedTheme, unsplashUris]);

  const player = useAudioPlayer(ambientSource);
  const affirmationsRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [affirmationText, setAffirmationText] = useState('');
  const [affirmationVisible, setAffirmationVisible] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const lastAffIndexRef = useRef(-1);
  const skipOffsetRef = useRef(0);
  const lastDisplayedSecRef = useRef(-1);
  const mutedRef = useRef(false);

  useEffect(() => {
    const custom = customAffirmations
      .filter((a) => a.themeId === selectedTheme)
      .map((a) => a.text);
    const library = getShuffledAffirmations(selectedTheme)
      .filter((t) => !hiddenLibraryAffirmations.includes(t));
    affirmationsRef.current = [...custom, ...library];
  }, [selectedTheme, customAffirmations, hiddenLibraryAffirmations]);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player.loop = true;
    player.volume = MUSIC_VOLUME;
    player.play();

    return () => {
      Speech.stop();
      player.pause();
    };
  }, [player]);

  const handleDuck = useCallback(() => {
    if (!mutedRef.current) player.volume = MUSIC_DUCK_VOLUME;
  }, [player]);

  const handleRestore = useCallback(() => {
    if (!mutedRef.current) player.volume = MUSIC_VOLUME;
  }, [player]);

  useEffect(() => {
    if (!sessionStartedAt) return;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - sessionStartedAt;
      const remaining = Math.max(0, durationMs - elapsed);
      const displaySec = Math.ceil(remaining / 1000);
      if (displaySec !== lastDisplayedSecRef.current) {
        lastDisplayedSecRef.current = displaySec;
        setRemainingMs(remaining);
      }

      if (isSessionComplete(elapsed, durationMs)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        Speech.stop();
        player.pause();
        endSession();
        return;
      }

      const adjustedElapsed = elapsed + skipOffsetRef.current;
      const affCount = affirmationsRef.current.length;
      if (affCount === 0) return;

      const affState = computeAffirmationState(adjustedElapsed, affCount);

      if (affState.visible && affState.index !== lastAffIndexRef.current) {
        lastAffIndexRef.current = affState.index;
        const text = affirmationsRef.current[affState.index];
        if (text) {
          setAffirmationText(text);
          setAffirmationVisible(true);
          setCurrentGradientIndex(
            Math.floor(adjustedElapsed / 4000) % theme.gradients.length,
          );
        }
      } else if (!affState.visible && lastAffIndexRef.current >= 0) {
        setAffirmationVisible(false);
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionStartedAt, durationMs, endSession, theme.gradients.length, player]);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    Speech.stop();
    player.pause();
    endSession();
  };

  const handleMuteToggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      if (next) {
        Speech.stop();
        player.volume = 0;
      } else {
        player.volume = MUSIC_VOLUME;
      }
      return next;
    });
  }, [player]);

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

  const isFav = useMemo(
    () => favorites.some((f) => f.themeId === selectedTheme && f.affirmation === affirmationText),
    [favorites, selectedTheme, affirmationText],
  );

  const [tapKey, setTapKey] = useState(0);
  const handleTapAnywhere = useCallback(() => setTapKey((k) => k + 1), []);

  return (
    <Pressable style={styles.root} onPress={handleTapAnywhere}>
      <CrossFadeView sources={visualSources} running={true} />

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
        onTapAnywhere={handleTapAnywhere}
      />

      <Pressable
        onPress={handleStop}
        style={[styles.stopBtn, { top: insets.top + 12 }]}
        hitSlop={12}
      >
        <Text style={styles.stopText}>✕</Text>
      </Pressable>
    </Pressable>
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
