import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  remainingMs: number;
};

export function SessionCountdown({ remainingMs }: Props) {
  const insets = useSafeAreaInsets();
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const display = `${min}:${sec.toString().padStart(2, '0')}`;

  return (
    <View style={[styles.container, { top: insets.top + 16 }]}>
      <Text style={styles.text}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
});
