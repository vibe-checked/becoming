import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from './src/store/useAppStore';
import { ThemePicker } from './src/ui/ThemePicker';
import { SessionPlayer } from './src/ui/SessionPlayer';
import { ReflectionModal } from './src/ui/ReflectionModal';

export default function App() {
  const [ready, setReady] = useState(false);
  const screen = useAppStore((s) => s.screen);
  const sessionPhase = useAppStore((s) => s.sessionPhase);
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

  if (!ready) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        {screen === 'theme_picker' && <ThemePicker />}
        {screen === 'session' && <SessionPlayer />}
        {sessionPhase === 'reflection' && <ReflectionModal />}
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
