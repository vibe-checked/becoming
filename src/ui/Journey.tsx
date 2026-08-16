import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore, MILESTONES } from '../store/useAppStore';
import { THEMES } from '../core/themes';
import { ReflectionEmoji, SessionRecord } from '../core/types';

type Props = {
  onClose: () => void;
};

const MOOD: Record<ReflectionEmoji, { icon: string; label: string }> = {
  grateful: { icon: '🙏', label: 'Grateful' },
  neutral: { icon: '😐', label: 'Neutral' },
  restless: { icon: '🌀', label: 'Restless' },
};

const MOOD_ORDER: ReflectionEmoji[] = ['grateful', 'neutral', 'restless'];

function relativeDate(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Journey({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const sessionCount = useAppStore((s) => s.sessionCount);
  const accentColor = useAppStore((s) => s.accentColor);
  const updateSessionRecord = useAppStore((s) => s.updateSessionRecord);

  const [editingRecord, setEditingRecord] = useState<SessionRecord | null>(null);

  const nextMilestone = MILESTONES.find((m) => m > currentStreak);
  const encouragement =
    currentStreak === 0
      ? 'Complete a session today to start your streak.'
      : nextMilestone
        ? `${nextMilestone - currentStreak} more day${nextMilestone - currentStreak === 1 ? '' : 's'} to your next milestone.`
        : "You've passed every milestone — this is just your practice now.";

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Journey</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={[styles.doneText, { color: accentColor }]}>Done</Text>
        </Pressable>
      </View>

      <LinearGradient
        colors={[`${accentColor}33`, `${accentColor}0d`, '#16161f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.momentumCard}
      >
        <View style={styles.momentumGlow1} />
        <View style={styles.momentumGlow2} />
        <View style={styles.momentumRow}>
          <View style={styles.momentumStat}>
            <Text style={styles.momentumEmoji}>🔥</Text>
            <Text style={styles.momentumNumber}>{currentStreak}</Text>
            <Text style={styles.momentumLabel}>
              day{currentStreak === 1 ? '' : 's'} streak
            </Text>
          </View>
          <View style={styles.momentumDivider} />
          <View style={styles.momentumStat}>
            <Text style={[styles.momentumNumber, styles.momentumNumberNoEmoji]}>
              {sessionCount}
            </Text>
            <Text style={styles.momentumLabel}>
              session{sessionCount === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
        <Text style={styles.encouragement}>{encouragement}</Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>History</Text>

      {sessionHistory.length === 0 ? (
        <Text style={styles.emptyText}>
          Your completed sessions will show up here, along with how you felt
          afterward.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {sessionHistory.map((record) => (
            <HistoryRow
              key={record.id}
              record={record}
              onPress={() => setEditingRecord(record)}
            />
          ))}
        </ScrollView>
      )}

      <EditHistoryModal
        record={editingRecord}
        accentColor={accentColor}
        onClose={() => setEditingRecord(null)}
        onSave={(reflection, note) => {
          if (editingRecord) {
            updateSessionRecord(editingRecord.id, { reflection, note });
          }
          setEditingRecord(null);
        }}
      />
    </View>
  );
}

function HistoryRow({
  record,
  onPress,
}: {
  record: SessionRecord;
  onPress: () => void;
}) {
  const theme = THEMES[record.themeId];
  const mood = MOOD[record.reflection];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.rowMoodIcon}>{mood.icon}</Text>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>
          {theme.emoji} {theme.label} · {formatDuration(record.durationSec)}
        </Text>
        <Text style={styles.rowMeta}>
          {relativeDate(record.completedAt)} · {mood.label}
        </Text>
        {record.note ? <Text style={styles.rowNote}>“{record.note}”</Text> : null}
      </View>
      <Text style={styles.rowChevron}>›</Text>
    </Pressable>
  );
}

function EditHistoryModal({
  record,
  accentColor,
  onClose,
  onSave,
}: {
  record: SessionRecord | null;
  accentColor: string;
  onClose: () => void;
  onSave: (reflection: ReflectionEmoji, note: string) => void;
}) {
  const [reflection, setReflection] = useState<ReflectionEmoji>('grateful');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (record) {
      setReflection(record.reflection);
      setNote(record.note);
    }
  }, [record]);

  return (
    <Modal visible={!!record} animationType="fade" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.editBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Edit reflection</Text>

          <View style={styles.emojiRow}>
            {MOOD_ORDER.map((key) => {
              const m = MOOD[key];
              const selected = reflection === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setReflection(key)}
                  style={[
                    styles.emojiBtn,
                    selected && { borderColor: accentColor, backgroundColor: `${accentColor}22` },
                  ]}
                >
                  <Text style={styles.emojiIcon}>{m.icon}</Text>
                  <Text style={styles.emojiLabel}>{m.label}</Text>
                </Pressable>
              );
            })}
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

          <View style={styles.editActions}>
            <Pressable onPress={onClose} style={styles.editCancelBtn}>
              <Text style={styles.editCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave(reflection, note.trim())}
              style={[styles.editSaveBtn, { backgroundColor: accentColor }]}
            >
              <Text style={styles.editSaveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    color: '#f0f0f5',
    letterSpacing: 1,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    paddingTop: 6,
  },
  momentumCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  momentumGlow1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -50,
  },
  momentumGlow2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -40,
    left: -30,
  },
  momentumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  momentumStat: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  momentumEmoji: {
    fontSize: 30,
    marginBottom: 2,
  },
  momentumNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  momentumNumberNoEmoji: {
    marginTop: 30,
  },
  momentumLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  momentumDivider: {
    width: 1,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  encouragement: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#777',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
  },
  list: {
    gap: 14,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#14141d',
    borderRadius: 16,
    padding: 16,
  },
  rowPressed: {
    backgroundColor: '#1a1a26',
  },
  rowMoodIcon: {
    fontSize: 26,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e8e8ee',
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  rowNote: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  rowChevron: {
    fontSize: 22,
    color: '#555',
    alignSelf: 'center',
    marginLeft: 4,
  },
  editBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  editCard: {
    width: '100%',
    backgroundColor: '#1a1a22',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#f0f0f5',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  emojiBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  emojiIcon: {
    fontSize: 32,
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
    marginBottom: 22,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  editCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  editSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0a0f',
  },
});
