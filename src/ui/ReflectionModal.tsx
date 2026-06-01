import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ReflectionEmoji } from '../core/types';
import { useAppStore } from '../store/useAppStore';

const EMOJIS: { key: ReflectionEmoji; icon: string; label: string }[] = [
  { key: 'grateful', icon: '🙏', label: 'Grateful' },
  { key: 'neutral', icon: '😐', label: 'Neutral' },
  { key: 'restless', icon: '🌀', label: 'Restless' },
];

export function ReflectionModal() {
  const sessionPhase = useAppStore((s) => s.sessionPhase);
  const submitReflection = useAppStore((s) => s.submitReflection);

  const [note, setNote] = useState('');
  const isVisible = sessionPhase === 'reflection';

  useEffect(() => {
    if (isVisible) setNote('');
  }, [isVisible]);

  const handleSelect = (emoji: ReflectionEmoji) => {
    submitReflection(emoji, note.trim());
    setNote('');
  };

  return (
    <Modal
      visible={sessionPhase === 'reflection'}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>How do you feel?</Text>

          <View style={styles.emojiRow}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e.key}
                onPress={() => handleSelect(e.key)}
                style={({ pressed }) => [
                  styles.emojiBtn,
                  pressed && styles.emojiBtnPressed,
                ]}
              >
                <Text style={styles.emojiIcon}>{e.icon}</Text>
                <Text style={styles.emojiLabel}>{e.label}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="One thought... (optional)"
            placeholderTextColor="#666"
            value={note}
            onChangeText={setNote}
            maxLength={200}
            returnKeyType="done"
            blurOnSubmit
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1a1a22',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '300',
    color: '#f0f0f5',
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 28,
  },
  emojiBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  emojiBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: '#555',
  },
  emojiIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  emojiLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#e0e0e8',
    fontWeight: '300',
  },
});
