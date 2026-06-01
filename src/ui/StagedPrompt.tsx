import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

type PromptConfig = {
  emoji: string;
  title: string;
  body: string;
  actionLabel: string;
};

const PROMPTS: Record<string, PromptConfig> = {
  try_theme: {
    emoji: '🎨',
    title: 'Try another theme?',
    body: 'Each theme has its own color palette and 30 unique affirmations.',
    actionLabel: 'Browse themes',
  },
  add_photos: {
    emoji: '📸',
    title: 'Add your own photos?',
    body: 'Long-press a theme card to add personal photos that play during your session.',
    actionLabel: 'Got it',
  },
  write_affirmation: {
    emoji: '✍️',
    title: 'Write your own affirmation?',
    body: 'Long-press a theme card to add custom affirmations that mix with the library.',
    actionLabel: 'Got it',
  },
  set_reminder: {
    emoji: '⏰',
    title: 'Set a daily ritual time?',
    body: 'A gentle notification can remind you to practice at the same time each day.',
    actionLabel: 'Set reminder',
  },
  record_voice: {
    emoji: '🎙️',
    title: 'Record your own voice?',
    body: 'Coming soon — record yourself reading affirmations for an even more personal experience.',
    actionLabel: 'Got it',
  },
};

type Props = {
  promptKey: string | null;
  onDismiss: () => void;
  onAction: (key: string) => void;
};

export function StagedPrompt({ promptKey, onDismiss, onAction }: Props) {
  if (!promptKey || !PROMPTS[promptKey]) return null;
  const prompt = PROMPTS[promptKey];

  return (
    <Modal visible={true} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.emoji}>{prompt.emoji}</Text>
          <Text style={styles.title}>{prompt.title}</Text>
          <Text style={styles.body}>{prompt.body}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onDismiss} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>Not now</Text>
            </Pressable>
            <Pressable
              onPress={() => onAction(promptKey)}
              style={styles.actionBtn}
            >
              <Text style={styles.actionText}>{prompt.actionLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function getNextPrompt(
  sessionCount: number,
  dismissedPrompts: string[],
): string | null {
  const candidates: [number, string][] = [
    [1, 'try_theme'],
    [2, 'add_photos'],
    [3, 'write_affirmation'],
    [5, 'set_reminder'],
    [10, 'record_voice'],
  ];

  for (const [threshold, key] of candidates) {
    if (sessionCount >= threshold && !dismissedPrompts.includes(key)) {
      return key;
    }
  }
  return null;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#1a1a24',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 44,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f0f0f5',
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  dismissBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  dismissText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#b088e0',
  },
  actionText: {
    fontSize: 14,
    color: '#0a0a12',
    fontWeight: '700',
  },
});
