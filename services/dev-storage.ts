import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DevModeState } from '@/types/timer';

const DEV_MODE_KEY = '@dev_mode_state';

// Preset days for quick testing
export const DEV_PRESETS = [
  { label: '1 Day', days: 1, isMilestone: false },
  { label: '7 Days', days: 7, isMilestone: true },
  { label: '14 Days', days: 14, isMilestone: true },
  { label: '21 Days', days: 21, isMilestone: false },
  { label: '30 Days', days: 30, isMilestone: true },
  { label: '60 Days', days: 60, isMilestone: true },
  { label: '89 Days', days: 89, isMilestone: false },
  { label: '90 Days', days: 90, isMilestone: true },
  { label: '91 Days', days: 91, isMilestone: false },
] as const;

export const DevStorageService = {
  /**
   * Get dev mode state from storage
   */
  async getDevMode(): Promise<DevModeState | null> {
    try {
      const data = await AsyncStorage.getItem(DEV_MODE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get dev mode state:', error);
      return null;
    }
  },

  /**
   * Save dev mode state to storage
   */
  async setDevMode(state: DevModeState): Promise<void> {
    try {
      await AsyncStorage.setItem(DEV_MODE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save dev mode state:', error);
      throw error;
    }
  },

  /**
   * Clear dev mode state from storage
   */
  async clearDevMode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DEV_MODE_KEY);
    } catch (error) {
      console.error('Failed to clear dev mode state:', error);
      throw error;
    }
  },

  /**
   * Calculate a start date that would result in the specified number of elapsed days
   * @param days Number of days to simulate as elapsed
   * @returns ISO string of the calculated start date
   */
  calculateStartDateForDays(days: number): string {
    const now = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(now.getTime() - days * millisecondsPerDay);
    return startDate.toISOString();
  },
};
