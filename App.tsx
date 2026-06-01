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

export default function App() {
  const [ready, setReady] = useState(false);
  const [showReel, setShowReel] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const screen = useAppStore((s) => s.screen);
  const sessionPhase = useAppStore((s) => s.sessionPhase);
  const sessionCount = useAppStore((s) => s.sessionCount);
  const dismissedPrompts = useAppStore((s) => s.dismissedPrompts);
  const dismissPrompt = useAppStore((s) => s.dismissPrompt);
  const hydrate = useAppStore((s) => s.hydrate);
  const persist = useAppStore((s) => s.persist);

  useEffect(() => {
    hydrate().then(() => setReady(true));
  }, [hydrate]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') {
        persist();
      }
    });
    return () => sub.remove();
  }, [persist]);

  useEffect(() => {
    if (screen === 'theme_picker' && sessionPhase === 'idle' && sessionCount > 0) {
      const prompt = getNextPrompt(sessionCount, dismissedPrompts);
      if (prompt) {
        const timer = setTimeout(() => setActivePrompt(prompt), 500);
        return () => clearTimeout(timer);
      }
    }
    setActivePrompt(null);
  }, [screen, sessionPhase, sessionCount, dismissedPrompts]);

  const handleDismissPrompt = () => {
    if (activePrompt) dismissPrompt(activePrompt);
    setActivePrompt(null);
  };

  const handlePromptAction = (key: string) => {
    dismissPrompt(key);
    setActivePrompt(null);
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
          <HighlightReel onClose={() => setShowReel(false)} />
        )}
        {screen === 'session' && <SessionPlayer />}
        {sessionPhase === 'reflection' && <ReflectionModal />}
        <StagedPrompt
          promptKey={activePrompt}
          onDismiss={handleDismissPrompt}
          onAction={handlePromptAction}
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
