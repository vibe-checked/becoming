import * as Notifications from 'expo-notifications';
import { ALL_THEME_IDS, THEMES } from './themes';
import { getAffirmations } from './affirmations';

// How many days of distinct daily notifications to keep queued at once.
// Local notifications can't repeat with different content each day, so we
// schedule a rolling window of one-off DATE triggers instead of a single
// repeating DAILY one — this is what lets each day's notification actually
// contain a real affirmation instead of the same generic reminder text.
const DAYS_AHEAD = 14;

function pickRandomAffirmation(): { themeId: (typeof ALL_THEME_IDS)[number]; text: string } {
  const themeId = ALL_THEME_IDS[Math.floor(Math.random() * ALL_THEME_IDS.length)];
  const pool = getAffirmations(themeId);
  const text = pool[Math.floor(Math.random() * pool.length)];
  return { themeId, text };
}

export async function scheduleUpcomingReminders(hour: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(hour, 0, 0, 0);

    const { themeId, text } = pickRandomAffirmation();
    const theme = THEMES[themeId];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${theme.emoji} ${theme.label}`,
        body: text,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  }
}
