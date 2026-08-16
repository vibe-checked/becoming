import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
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

function relativeDate(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function Journey({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const sessionCount = useAppStore((s) => s.sessionCount);
  const accentColor = useAppStore((s) => s.accentColor);

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

      <View style={styles.momentumCard}>
        <View style={styles.momentumRow}>
          <View style={styles.momentumStat}>
            <Text style={styles.momentumNumber}>🔥 {currentStreak}</Text>
            <Text style={styles.momentumLabel}>
              day{currentStreak === 1 ? '' : 's'} streak
            </Text>
          </View>
          <View style={styles.momentumDivider} />
          <View style={styles.momentumStat}>
            <Text style={styles.momentumNumber}>{sessionCount}</Text>
            <Text style={styles.momentumLabel}>
              session{sessionCount === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
        <Text style={styles.encouragement}>{encouragement}</Text>
      </View>

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
            <HistoryRow key={record.id} record={record} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function HistoryRow({ record }: { record: SessionRecord }) {
  const theme = THEMES[record.themeId];
  const mood = MOOD[record.reflection];
  return (
    <View style={styles.row}>
      <Text style={styles.rowMoodIcon}>{mood.icon}</Text>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>
          {theme.emoji} {theme.label} · {record.durationMin} min
        </Text>
        <Text style={styles.rowMeta}>
          {relativeDate(record.completedAt)} · {mood.label}
        </Text>
        {record.note ? <Text style={styles.rowNote}>“{record.note}”</Text> : null}
      </View>
    </View>
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
    backgroundColor: '#16161f',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  momentumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  momentumStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  momentumNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f0f0f5',
    marginBottom: 4,
  },
  momentumLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  momentumDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#2a2a35',
  },
  encouragement: {
    fontSize: 14,
    color: '#aaa',
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
});
