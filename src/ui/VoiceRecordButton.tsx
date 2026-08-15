import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioPlayer,
} from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import * as Haptics from 'expo-haptics';

type Props = {
  affirmationId: string;
  voiceUri?: string;
  onVoiceRecorded: (uri: string) => void;
  onVoiceRemoved: () => void;
};

// Lets a user record their own voice reading a specific custom affirmation
// (ThinkUp's signature mechanic) — recorded once per affirmation, played
// back during sessions instead of TTS when present (see AffirmationCard).
export function VoiceRecordButton({
  affirmationId,
  voiceUri,
  onVoiceRecorded,
  onVoiceRemoved,
}: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(voiceUri ?? null);
  const [busy, setBusy] = useState(false);

  const handleRecordPress = useCallback(async () => {
    if (recorderState.isRecording) {
      setBusy(true);
      try {
        await recorder.stop();
        const tempUri = recorder.uri;
        if (tempUri) {
          const dir = new Directory(Paths.document, 'voice-recordings');
          if (!dir.exists) dir.create({ intermediates: true });
          const dest = new File(dir, `${affirmationId}.m4a`);
          if (dest.exists) dest.delete();
          const tempFile = new File(tempUri);
          await tempFile.copy(dest);
          tempFile.delete();
          onVoiceRecorded(dest.uri);
        }
      } catch {
        Alert.alert('Recording failed', 'Please try again.');
      } finally {
        setBusy(false);
      }
      return;
    }

    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Microphone access needed',
        'Enable microphone access in Settings to record your own voice.',
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await recorder.prepareToRecordAsync();
    recorder.record();
  }, [recorder, recorderState.isRecording, affirmationId, onVoiceRecorded]);

  const handlePlayPress = useCallback(() => {
    if (!voiceUri) return;
    player.seekTo(0);
    player.play();
  }, [player, voiceUri]);

  return (
    <View style={styles.row}>
      {voiceUri && !recorderState.isRecording && (
        <Pressable onPress={handlePlayPress} style={styles.iconBtn} hitSlop={8}>
          <Text style={styles.icon}>▶️</Text>
        </Pressable>
      )}
      <Pressable
        onPress={handleRecordPress}
        style={[styles.iconBtn, recorderState.isRecording && styles.iconBtnActive]}
        hitSlop={8}
        disabled={busy}
      >
        <Text style={styles.icon}>{recorderState.isRecording ? '⏹️' : '🎙️'}</Text>
      </Pressable>
      {voiceUri && !recorderState.isRecording && (
        <Pressable onPress={onVoiceRemoved} style={styles.iconBtn} hitSlop={8}>
          <Text style={styles.removeIcon}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(212,68,68,0.25)',
  },
  icon: {
    fontSize: 14,
  },
  removeIcon: {
    fontSize: 12,
    color: '#888',
  },
});
