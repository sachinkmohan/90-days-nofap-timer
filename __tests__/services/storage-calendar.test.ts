import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '@/services/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('StorageService calendar start date', () => {
  it('returns null when no calendar start date has been set', async () => {
    const result = await StorageService.getCalendarStartDate();
    expect(result).toBeNull();
  });

  it('stores and retrieves the calendar start date', async () => {
    await StorageService.setCalendarStartDate('2026-01-01T00:00:00.000Z');
    const result = await StorageService.getCalendarStartDate();
    expect(result).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('StorageService.addCalendarEvent', () => {
  it('stores a relapse event and retrieves it', async () => {
    await StorageService.addCalendarEvent({ date: '2026-03-20', type: 'relapsed' });
    const events = await StorageService.getCalendarEvents();
    expect(events).toEqual([{ date: '2026-03-20', type: 'relapsed' }]);
  });

  it('does not add a duplicate event for the same date', async () => {
    await StorageService.addCalendarEvent({ date: '2026-03-20', type: 'relapsed' });
    await StorageService.addCalendarEvent({ date: '2026-03-20', type: 'relapsed' });
    const events = await StorageService.getCalendarEvents();
    expect(events).toHaveLength(1);
  });
});
