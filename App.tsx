import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from './src/store/useAppStore';
import { ThemePicker } from './src/ui/ThemePicker';
import { SessionPlayer } from './src/ui/SessionPlayer';
import { ReflectionModal } from './src/ui/ReflectionModal';
import { HighlightReel } from './src/ui/HighlightReel';
import { StagedPrompt, getNextPrompt } from './src/ui/StagedPrompt';
import { ReminderPicker } from './src/ui/ReminderPicker';
import { StreakMilestoneModal } from './src/ui/StreakMilestoneModal';
import * as Notifications from 'expo-notifications';
import { scheduleUpcomingReminders } from './src/core/reminders';

export default function App() {
  const [ready, setReady] = useState(false);
  const [showReel, setShowReel] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const screen = useAppStore((s) => s.screen);
  const sessionPhase = useAppStore((s) => s.sessionPhase);
  const sessionCount = useAppStore((s) => s.sessionCount);
  const dismissedPrompts = useAppStore((s) => s.dismissedPrompts);
  const dismissPrompt = useAppStore((s) => s.dismissPrompt);
  const hydrate = useAppStore((s) => s.hydrate);
  const persist = useAppStore((s) => s.persist);
  const selectTheme = useAppStore((s) => s.selectTheme);
  const startSession = useAppStore((s) => s.startSession);
  const dailyReminderHour = useAppStore((s) => s.dailyReminderHour);
  const justHitMilestone = useAppStore((s) => s.justHitMilestone);

  useEffect(() => {
    hydrate().then(() => setReady(true));
  }, [hydrate]);

  useEffect(() => {
    // Local notifications can't repeat with different content per day, so
    // the reminder is a rolling window of one-off notifications (see
    // core/reminders.ts) — top it back up to a full window on every launch
    // rather than only when the user changes the reminder time, so it never
    // silently runs dry after the window's last day passes.
    if (!ready || dailyReminderHour === null) return;
    Notifications.getPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        scheduleUpcomingReminders(dailyReminderHour).catch(() => {});
      }
    });
  }, [ready, dailyReminderHour]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') {
        persist();
      }
    });
    return () => sub.remove();
  }, [persist]);

  useEffect(() => {
    // Skip the staged-prompt check when a streak milestone just fired —
    // showing both overlays at once (a rare but possible collision, e.g. at
    // sessionCount 3) would stack two full-screen modals on top of each other.
    if (
      screen === 'theme_picker' &&
      sessionPhase === 'idle' &&
      sessionCount > 0 &&
      justHitMilestone === null
    ) {
      const prompt = getNextPrompt(sessionCount, dismissedPrompts);
      if (prompt) {
        const timer = setTimeout(() => setActivePrompt(prompt), 500);
        return () => clearTimeout(timer);
      }
    }
    setActivePrompt(null);
  }, [screen, sessionPhase, sessionCount, dismissedPrompts, justHitMilestone]);

  const handleDismissPrompt = () => {
    if (activePrompt) dismissPrompt(activePrompt);
    setActivePrompt(null);
  };

  const handlePromptAction = (key: string) => {
    dismissPrompt(key);
    setActivePrompt(null);
    if (key === 'set_reminder') {
      setShowReminder(true);
    }
  };

  if (!ready) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        {screen === 'theme_picker' && !showReel && (
          <ThemePicker onOpenHighlightReel={() => setShowReel(true)} />
        )}
        {screen === 'theme_picker' && showReel && (
          <HighlightReel
            onClose={() => setShowReel(false)}
            onSelectTheme={(id) => {
              setShowReel(false);
              selectTheme(id);
              startSession();
            }}
          />
        )}
        {screen === 'session' && <SessionPlayer />}
        {sessionPhase === 'reflection' && <ReflectionModal />}
        <StreakMilestoneModal />
        <StagedPrompt
          promptKey={activePrompt}
          onDismiss={handleDismissPrompt}
          onAction={handlePromptAction}
        />
        <ReminderPicker
          visible={showReminder}
          onClose={() => setShowReminder(false)}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
});
