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
const MAX_DAILY_TO_SCHEDULE = 60;

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
    const remainingDays = Math.min(90 - currentDayInRound + 1, MAX_DAILY_TO_SCHEDULE);

    for (let i = 0; i < remainingDays; i++) {
      const dayNum = currentDayInRound + i;

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

  async fireMilestoneNotification(days: MilestoneDays): Promise<boolean> {
    const granted = await this.requestPermission();
    if (!granted) return false;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '90 Days',
          body: getMilestoneNotificationBody(days),
        },
        trigger: null,
      });
      return true;
    } catch {
      return false;
    }
  },

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
