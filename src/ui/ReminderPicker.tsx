import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '../store/useAppStore';
import { scheduleUpcomingReminders } from '../core/reminders';
import { accentTint } from '../core/accentColors';

const HOURS = [6, 7, 8, 9, 10, 11, 12, 17, 18, 19, 20, 21];

function formatHour(h: number): string {
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${period}`;
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ReminderPicker({ visible, onClose }: Props) {
  const dailyReminderHour = useAppStore((s) => s.dailyReminderHour);
  const setDailyReminder = useAppStore((s) => s.setDailyReminder);
  const accentColor = useAppStore((s) => s.accentColor);
  const [selected, setSelected] = useState(dailyReminderHour ?? 8);

  const handleSave = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setDailyReminder(null);
        onClose();
        return;
      }

      await scheduleUpcomingReminders(selected);
    }

    setDailyReminder(selected);
    onClose();
  };

  const handleRemove = async () => {
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    setDailyReminder(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Daily Reminder</Text>
          <Text style={styles.subtitle}>When would you like to practice?</Text>

          <View style={styles.grid}>
            {HOURS.map((h) => (
              <Pressable
                key={h}
                onPress={() => setSelected(h)}
                style={[
                  styles.chip,
                  selected === h && {
                    borderColor: accentColor,
                    backgroundColor: accentTint(accentColor, 0.15),
                  },
                ]}
              >
                <Text
                  style={[styles.chipText, selected === h && { color: accentColor }]}
                >
                  {formatHour(h)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            {dailyReminderHour !== null && (
              <Pressable onPress={handleRemove} style={styles.removeBtn}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: accentColor }]}
            >
              <Text style={styles.saveText}>Set</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
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
    padding: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f0f0f5',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 28,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  removeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d44',
  },
  removeText: {
    fontSize: 14,
    color: '#d44',
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cancelText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  saveText: {
    fontSize: 14,
    color: '#0a0a12',
    fontWeight: '700',
  },
});
