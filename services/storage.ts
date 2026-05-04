import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalendarEvent, Round, RelapseEvent, CheckInEntry } from '@/types/timer';
import type { NotificationPreset } from '@/utils/notifications';

const KEYS = {
  TIMER_STATE: '@timer_state',
  RESET_HISTORY: '@reset_history',
  CELEBRATION_SHOWN: '@celebration_shown',
  CALENDAR_EVENTS: '@calendar_events',
  CALENDAR_START_DATE: '@calendar_start_date',
  ONBOARDING_COMPLETE: '@onboarding_complete',
  ROUNDS: '@rounds',
  CHECK_INS: '@check_ins',
  NOTIFICATION_PRESET: '@notification_preset',
  NOTIFIED_MILESTONES: '@notified_milestones',
} as const;

// Simple async mutex for serializing calendar event writes
let historyWriteLock: Promise<void> = Promise.resolve();

async function withHistoryLock<T>(fn: () => Promise<T>): Promise<T> {
  let releaseLock: () => void;
  const currentLock = historyWriteLock;
  historyWriteLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  await currentLock;
  try {
    return await fn();
  } finally {
    releaseLock!();
  }
}

export const StorageService = {
  // Celebration tracking (keyed by streak start date to show once per streak)
  async hasCelebrationBeenShown(streakStartDate: string): Promise<boolean> {
    const data = await AsyncStorage.getItem(KEYS.CELEBRATION_SHOWN);
    if (!data) return false;
    const shown: string[] = JSON.parse(data);
    return shown.includes(streakStartDate);
  },

  async markCelebrationShown(streakStartDate: string): Promise<void> {
    const data = await AsyncStorage.getItem(KEYS.CELEBRATION_SHOWN);
    const shown: string[] = data ? JSON.parse(data) : [];
    if (!shown.includes(streakStartDate)) {
      shown.push(streakStartDate);
      await AsyncStorage.setItem(KEYS.CELEBRATION_SHOWN, JSON.stringify(shown));
    }
  },

  // Onboarding
  async hasCompletedOnboarding(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return val === 'true';
  },

  async markOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
  },

  // Calendar start date (fixed anchor - never changes on reset)
  async getCalendarStartDate(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.CALENDAR_START_DATE);
  },

  async setCalendarStartDate(isoDate: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.CALENDAR_START_DATE, isoDate);
  },

  // Calendar events
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const data = await AsyncStorage.getItem(KEYS.CALENDAR_EVENTS);
    return data ? JSON.parse(data) : [];
  },

  async addCalendarEvent(event: CalendarEvent): Promise<void> {
    await withHistoryLock(async () => {
      try {
        const events = await this.getCalendarEvents();
        if (!events.some((e) => e.date === event.date)) {
          events.push(event);
          await AsyncStorage.setItem(KEYS.CALENDAR_EVENTS, JSON.stringify(events));
        }
      } catch (error) {
        console.error('Failed to add calendar event:', error);
        throw error;
      }
    });
  },

  async clearCalendarEvents(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.CALENDAR_EVENTS);
  },

  // Rounds
  async getRounds(): Promise<Round[]> {
    const data = await AsyncStorage.getItem(KEYS.ROUNDS);
    return data ? JSON.parse(data) : [];
  },

  async startNewRound(): Promise<Round> {
    return this.createRoundWithDate(new Date().toISOString());
  },

  async createRoundWithDate(startDate: string): Promise<Round> {
    const rounds = await this.getRounds();
    const round: Round = {
      id: generateUUID(),
      roundNumber: rounds.length + 1,
      startDate,
      endDate: null,
      relapses: [],
    };
    rounds.push(round);
    await AsyncStorage.setItem(KEYS.ROUNDS, JSON.stringify(rounds));
    return round;
  },

  async saveRelapse(roundId: string, event: RelapseEvent): Promise<void> {
    const rounds = await this.getRounds();
    const idx = rounds.findIndex((r) => r.id === roundId);
    if (idx === -1) {
      console.warn(`saveRelapse: round not found for id "${roundId}"`);
      return;
    }
    rounds[idx].relapses.push(event);
    await AsyncStorage.setItem(KEYS.ROUNDS, JSON.stringify(rounds));
  },

  async completeRound(roundId: string, endDate: string): Promise<void> {
    const rounds = await this.getRounds();
    const idx = rounds.findIndex((r) => r.id === roundId);
    if (idx === -1) {
      console.warn(`completeRound: round not found for id "${roundId}"`);
      return;
    }
    rounds[idx].endDate = endDate;
    await AsyncStorage.setItem(KEYS.ROUNDS, JSON.stringify(rounds));
  },

  // Check-ins
  async getCheckIns(): Promise<CheckInEntry[]> {
    const data = await AsyncStorage.getItem(KEYS.CHECK_INS);
    return data ? JSON.parse(data) : [];
  },

  async saveCheckIn(entry: CheckInEntry): Promise<void> {
    const checkIns = await this.getCheckIns();
    const idx = checkIns.findIndex((c) => c.date === entry.date);
    if (idx !== -1) {
      checkIns[idx] = entry;
    } else {
      checkIns.push(entry);
    }
    await AsyncStorage.setItem(KEYS.CHECK_INS, JSON.stringify(checkIns));
  },

  // Notification preset
  async getNotificationPreset(): Promise<NotificationPreset | null> {
    const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_PRESET);
    return data as NotificationPreset | null;
  },

  async saveNotificationPreset(preset: NotificationPreset): Promise<void> {
    await AsyncStorage.setItem(KEYS.NOTIFICATION_PRESET, preset);
  },

  // Notified milestones — keyed per streak (roundId + streakId) so a new clean
  // streak after a relapse can re-fire the same milestone thresholds.
  async getNotifiedMilestones(roundId: string, streakId: string): Promise<number[]> {
    const data = await AsyncStorage.getItem(`${KEYS.NOTIFIED_MILESTONES}_${roundId}_${streakId}`);
    return data ? JSON.parse(data) : [];
  },

  async saveNotifiedMilestone(roundId: string, streakId: string, days: number): Promise<void> {
    const existing = await this.getNotifiedMilestones(roundId, streakId);
    if (!existing.includes(days)) {
      existing.push(days);
      await AsyncStorage.setItem(`${KEYS.NOTIFIED_MILESTONES}_${roundId}_${streakId}`, JSON.stringify(existing));
    }
  },

  // Clear all data (for testing/debug)
  async clearAllData(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const milestoneKeys = allKeys.filter((k) => k.startsWith(KEYS.NOTIFIED_MILESTONES));
    await AsyncStorage.multiRemove([
      KEYS.TIMER_STATE,
      KEYS.RESET_HISTORY,
      KEYS.CELEBRATION_SHOWN,
      KEYS.CALENDAR_EVENTS,
      KEYS.CALENDAR_START_DATE,
      KEYS.ONBOARDING_COMPLETE,
      KEYS.ROUNDS,
      KEYS.CHECK_INS,
      KEYS.NOTIFICATION_PRESET,
      ...milestoneKeys,
    ]);
  },
};

// UUID generator
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
