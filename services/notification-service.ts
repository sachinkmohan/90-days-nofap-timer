import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import {
  getPresetHour,
  getDailyNotificationBody,
  getMilestoneNotificationBody,
  type NotificationPreset,
  type MilestoneDays,
} from '@/utils/notifications';
import { getDayInRound } from '@/utils/rounds';

const DAILY_ID_PREFIX = 'daily-day-';
const DAYS_TO_SCHEDULE = 7;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async requestPermission(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleDailyNotifications(
    preset: NotificationPreset,
    roundStartDate: string
  ): Promise<void> {
    await this.cancelDailyNotifications();

    const granted = await this.requestPermission();
    if (!granted) return;

    const hour = getPresetHour(preset);
    const today = new Date();
    const currentDayInRound = getDayInRound(roundStartDate);

    for (let i = 0; i < DAYS_TO_SCHEDULE; i++) {
      const dayNum = currentDayInRound + i;
      if (dayNum > 90) break;

      const triggerDate = new Date(today);
      triggerDate.setDate(today.getDate() + i);
      triggerDate.setHours(hour, 0, 0, 0);

      if (triggerDate <= today) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `${DAILY_ID_PREFIX}${dayNum}`,
        content: {
          title: '90 Days',
          body: getDailyNotificationBody(dayNum),
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  },

  async cancelDailyNotifications(): Promise<void> {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    const dailyIds = pending
      .filter((n) => n.identifier.startsWith(DAILY_ID_PREFIX))
      .map((n) => n.identifier);
    for (const id of dailyIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  },

  async fireMilestoneNotification(days: MilestoneDays): Promise<void> {
    const granted = await this.requestPermission();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '90 Days',
        body: getMilestoneNotificationBody(days),
      },
      trigger: null,
    });
  },

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
