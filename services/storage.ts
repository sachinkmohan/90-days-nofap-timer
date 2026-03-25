import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TimerState, ResetEntry, CalendarEvent } from '@/types/timer';

const KEYS = {
  TIMER_STATE: '@timer_state',
  RESET_HISTORY: '@reset_history',
  CELEBRATION_SHOWN: '@celebration_shown',
  CALENDAR_EVENTS: '@calendar_events',
  CALENDAR_START_DATE: '@calendar_start_date',
  ONBOARDING_COMPLETE: '@onboarding_complete',
} as const;

const MAX_HISTORY_ENTRIES = 100;

// Simple async mutex for serializing history writes
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
  // Timer State
  async getTimerState(): Promise<TimerState | null> {
    const data = await AsyncStorage.getItem(KEYS.TIMER_STATE);
    return data ? JSON.parse(data) : null;
  },

  async setTimerState(state: TimerState): Promise<void> {
    await AsyncStorage.setItem(KEYS.TIMER_STATE, JSON.stringify(state));
  },

  // History
  async getHistory(): Promise<ResetEntry[]> {
    const data = await AsyncStorage.getItem(KEYS.RESET_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  async addHistoryEntry(entry: ResetEntry): Promise<void> {
    await withHistoryLock(async () => {
      try {
        const history = await this.getHistory();
        history.unshift(entry); // Add to beginning (newest first)

        // Enforce max history size
        if (history.length > MAX_HISTORY_ENTRIES) {
          history.length = MAX_HISTORY_ENTRIES;
        }

        await AsyncStorage.setItem(KEYS.RESET_HISTORY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to add history entry:', error);
        throw error;
      }
    });
  },

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

  async clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.RESET_HISTORY);
  },

  async clearCalendarEvents(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.CALENDAR_EVENTS);
  },

  // Clear all data (for testing/debug)
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.TIMER_STATE,
      KEYS.RESET_HISTORY,
      KEYS.CELEBRATION_SHOWN,
      KEYS.CALENDAR_EVENTS,
      KEYS.CALENDAR_START_DATE,
      KEYS.ONBOARDING_COMPLETE,
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
