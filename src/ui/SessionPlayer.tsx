import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
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
const SPEED_STEPS = [1, 1.5, 2, 2.5];

const ambientSource = require('../../assets/music/ambient.mp3');

export function SessionPlayer() {
  useKeepAwake();
  const insets = useSafeAreaInsets();

  const selectedTheme = useAppStore((s) => s.selectedTheme);
  const selectedDuration = useAppStore((s) => s.selectedDuration);
  const sessionStartedAt = useAppStore((s) => s.sessionStartedAt);
  const endSession = useAppStore((s) => s.endSession);
  const resonatedPhotosByTheme = useAppStore((s) => s.resonatedPhotosByTheme);
  const toggleResonatedPhoto = useAppStore((s) => s.toggleResonatedPhoto);
  const customAffirmations = useAppStore((s) => s.customAffirmations);
  const hiddenLibraryAffirmations = useAppStore((s) => s.hiddenLibraryAffirmations);
  const userPhotos = useAppStore((s) => s.userPhotos);

  const theme = THEMES[selectedTheme];
  const durationMs = selectedDuration * 60 * 1000;

  const [unsplashUris, setUnsplashUris] = useState<string[]>([]);
  // Snapshot the resonated list once, at session mount, rather than reading
  // resonatedPhotosByTheme live in visualSources below. Tapping Resonance
  // mid-session writes into the store immediately, and since CrossFadeView
  // tracks its current photo by array index (not by identity), recomputing
  // visualSources' order mid-session shifts every index to a different
  // photo — the exact "jumps back to a previous picture" bug reported after
  // 1.4 shipped favorite-first ordering.
  const sessionResonatedRef = useRef(resonatedPhotosByTheme[selectedTheme] ?? []);

  useEffect(() => {
    let cancelled = false;
    // The `count` argument only matters for the live Unsplash API path,
    // which isn't wired up (no API key is ever set) — the curated fallback
    // that always runs returns its whole shuffled per-theme list regardless.
    fetchThemeImages(selectedTheme).then((images) => {
      if (!cancelled && images.length > 0) {
        const urls = images.map((i) => i.url);
        setUnsplashUris(urls);
        // Warm the cache for the whole session's shuffled set up front, since
        // otherwise each photo's first appearance is an uncached network
        // fetch that can visibly stall mid-Ken-Burns-animation.
        Image.prefetch(urls).catch(() => {});
      }
    });
    return () => { cancelled = true; };
  }, [selectedTheme]);

  const visualSources: VisualSource[] = useMemo(() => {
    const photoSources: VisualSource[] = userPhotos
      .filter((p) => p.themeId === selectedTheme)
      .map((p) => ({ type: 'photo' as const, uri: p.uri }));
    const unsplashSources: VisualSource[] = unsplashUris.map((uri) => ({
      type: 'photo' as const,
      uri,
    }));
    // Gradients are a fallback for when there's no photo to show at all
    // (e.g. photos haven't loaded yet), not a guaranteed part of every
    // session — appending them unconditionally meant every session hit a
    // ~12s block of plain color once it had cycled through all the photos.
    const allPhotos = [...unsplashSources, ...photoSources];
    if (allPhotos.length === 0) {
      return theme.gradients.map((g) => ({ type: 'gradient' as const, gradient: g }));
    }
    // Open with every photo resonated in this theme, most-recently-resonated
    // first, instead of leaving them to show up wherever they land in the
    // shuffle — once that list runs out, fall through to the rest of the
    // pool. Uses the mount-time snapshot (see sessionResonatedRef above),
    // not the live store value, so resonating mid-session doesn't reshuffle
    // the array the session is already actively cycling through.
    const resonated = sessionResonatedRef.current;
    if (resonated.length > 0) {
      const resonatedSet = new Set(resonated);
      const rest = allPhotos.filter(
        (p) => p.type !== 'photo' || !resonatedSet.has(p.uri),
      );
      return [
        ...resonated.map((uri) => ({ type: 'photo' as const, uri })),
        ...rest,
      ];
    }
    return allPhotos;
  }, [theme.gradients, userPhotos, selectedTheme, unsplashUris]);

  const player = useAudioPlayer(ambientSource);
  // expo-audio can tear down the native player object out of band (e.g. during
  // rapid unmount right after ending a session); calling into it afterward
  // throws NativeSharedObjectNotFoundException, so every call is guarded.
  const safePlayerCall = useCallback((fn: () => void) => {
    try {
      fn();
    } catch {}
  }, []);
  const affirmationsRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [affirmationText, setAffirmationText] = useState('');
  const [affirmationVisible, setAffirmationVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const [visualSkipSignal, setVisualSkipSignal] = useState(0);
  const lastAffIndexRef = useRef(-1);
  const skipOffsetRef = useRef(0);
  const lastDisplayedSecRef = useRef(-1);
  const mutedRef = useRef(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speedMultiplierRef = useRef(1);
  // Elapsed time is accumulated tick-by-tick at the current speed rather than
  // derived as (Date.now() - sessionStartedAt) * speedMultiplier, so changing
  // speed mid-session doesn't cause a discontinuous jump in session progress.
  const virtualElapsedRef = useRef(0);
  const lastTickRealRef = useRef<number | null>(null);

  useEffect(() => {
    const custom = customAffirmations
      .filter((a) => a.themeId === selectedTheme)
      .map((a) => a.text);
    const library = getShuffledAffirmations(selectedTheme)
      .filter((t) => !hiddenLibraryAffirmations.includes(t));
    affirmationsRef.current = [...custom, ...library];
  }, [selectedTheme, customAffirmations, hiddenLibraryAffirmations]);

  // Maps a custom affirmation's text back to its recorded voice clip (if
  // any), so AffirmationCard can play the user's own voice instead of TTS.
  // Matched by text since the shuffled playback pool above is just strings.
  const customVoiceByText = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of customAffirmations) {
      if (a.themeId === selectedTheme && a.voiceUri) map[a.text] = a.voiceUri;
    }
    return map;
  }, [customAffirmations, selectedTheme]);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    safePlayerCall(() => {
      player.loop = true;
      player.volume = mutedRef.current ? 0 : MUSIC_VOLUME;
      player.play();
    });

    return () => {
      Speech.stop();
      safePlayerCall(() => player.pause());
    };
  }, [player, safePlayerCall]);

  const handleDuck = useCallback(() => {
    if (!mutedRef.current) safePlayerCall(() => { player.volume = MUSIC_DUCK_VOLUME; });
  }, [player, safePlayerCall]);

  const handleRestore = useCallback(() => {
    if (!mutedRef.current) safePlayerCall(() => { player.volume = MUSIC_VOLUME; });
  }, [player, safePlayerCall]);

  useEffect(() => {
    if (!sessionStartedAt) return;

    virtualElapsedRef.current = 0;
    lastTickRealRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaReal = now - (lastTickRealRef.current ?? now);
      lastTickRealRef.current = now;
      virtualElapsedRef.current += deltaReal * speedMultiplierRef.current;
      const elapsed = virtualElapsedRef.current;
      const remaining = Math.max(0, durationMs - elapsed);
      const displaySec = Math.ceil(remaining / 1000);
      if (displaySec !== lastDisplayedSecRef.current) {
        lastDisplayedSecRef.current = displaySec;
        setRemainingMs(remaining);
      }

      if (isSessionComplete(elapsed, durationMs)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        Speech.stop();
        safePlayerCall(() => player.pause());
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
  }, [sessionStartedAt, durationMs, endSession, theme.gradients.length, player, safePlayerCall]);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    Speech.stop();
    safePlayerCall(() => player.pause());
    endSession();
  };

  const handleMuteToggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      if (next) {
        Speech.stop();
        safePlayerCall(() => { player.volume = 0; });
      } else {
        safePlayerCall(() => { player.volume = MUSIC_VOLUME; });
      }
      return next;
    });
  }, [player, safePlayerCall]);

  const handleSkip = useCallback(() => {
    Speech.stop();
    skipOffsetRef.current += AFFIRMATION_INTERVAL_MS;
    lastAffIndexRef.current = -1;
    setAffirmationVisible(false);
    setVisualSkipSignal((s) => s + 1);
  }, []);

  const handleSpeedCycle = useCallback(() => {
    setSpeedMultiplier((prev) => {
      const idx = SPEED_STEPS.indexOf(prev);
      const next = SPEED_STEPS[(idx + 1) % SPEED_STEPS.length];
      speedMultiplierRef.current = next;
      return next;
    });
  }, []);

  const [currentVisualSource, setCurrentVisualSource] = useState<VisualSource | null>(null);

  const handleResonance = useCallback(() => {
    if (!currentVisualSource || currentVisualSource.type !== 'photo') return;
    toggleResonatedPhoto(selectedTheme, currentVisualSource.uri);
  }, [currentVisualSource, selectedTheme, toggleResonatedPhoto]);

  const isFav = useMemo(
    () =>
      !!currentVisualSource &&
      currentVisualSource.type === 'photo' &&
      (resonatedPhotosByTheme[selectedTheme] ?? []).includes(currentVisualSource.uri),
    [currentVisualSource, resonatedPhotosByTheme, selectedTheme],
  );

  const [tapKey, setTapKey] = useState(0);
  const handleTapAnywhere = useCallback(() => setTapKey((k) => k + 1), []);

  const shareShotRef = useRef<ViewShotRef>(null);
  const handleShare = useCallback(async () => {
    try {
      const capture = shareShotRef.current?.capture;
      if (!capture) return;
      const uri = await capture();
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { dialogTitle: 'Share this affirmation' });
      }
    } catch {}
  }, []);

  return (
    <Pressable style={styles.root} onPress={handleTapAnywhere}>
      <ViewShot ref={shareShotRef} style={StyleSheet.absoluteFill} options={{ format: 'jpg', quality: 0.92 }}>
        <CrossFadeView
          sources={visualSources}
          running={true}
          skipSignal={visualSkipSignal}
          onActiveSourceChange={setCurrentVisualSource}
          speedMultiplier={speedMultiplier}
        />

        <AffirmationCard
          text={affirmationText}
          visible={affirmationVisible}
          ttsEnabled={!muted}
          voiceUri={customVoiceByText[affirmationText]}
          onDuckAudio={muted ? undefined : handleDuck}
          onRestoreAudio={muted ? undefined : handleRestore}
        />
      </ViewShot>

      <SessionCountdown remainingMs={remainingMs} />

      <SessionControls
        muted={muted}
        isFavorited={isFav}
        speedMultiplier={speedMultiplier}
        onMuteToggle={handleMuteToggle}
        onSkip={handleSkip}
        onResonance={handleResonance}
        onSpeedCycle={handleSpeedCycle}
        onShare={handleShare}
        tapSignal={tapKey}
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
