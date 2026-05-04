import { getDayStatus, getCalendarPage, toLocalDateStr } from '@/utils/calendar';
import type { CalendarEvent } from '@/types/timer';

beforeAll(() => {
  jest.useFakeTimers();
  // Set a fixed date for all tests in this file: Wednesday, March 25, 2026
  jest.setSystemTime(new Date('2026-03-25T12:00:00Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}


describe('getDayStatus', () => {
  it('returns future for a day index whose date is after today', () => {
    const startDate = daysAgo(0); // started today
    // dayIndex 5 = 5 days from startDate = 5 days in the future
    expect(getDayStatus(startDate, 5, [])).toBe('future');
  });

  it('returns today for a day index whose date matches today', () => {
    const startDate = daysAgo(3); // started 3 days ago
    // dayIndex 3 = today
    expect(getDayStatus(startDate, 3, [])).toBe('today');
  });

  it('returns clean for a past day with no relapse event', () => {
    const startDate = daysAgo(5);
    // dayIndex 1 = 4 days ago, no events
    expect(getDayStatus(startDate, 1, [])).toBe('clean');
  });

  it('returns relapsed (not today) when there is a relapse event for today', () => {
    const startDate = daysAgo(3);
    const todayStr = toLocalDateStr(new Date());
    const events: CalendarEvent[] = [{ date: todayStr, type: 'relapsed' }];
    // dayIndex 3 = today
    expect(getDayStatus(startDate, 3, events)).toBe('relapsed');
  });

  it('returns relapsed for a past day that has a matching calendar event', () => {

    const startDate = daysAgo(5);
    const relapsedDate = daysAgo(3); // dayIndex 2
    const events: CalendarEvent[] = [
      {
        date: `${relapsedDate.getFullYear()}-${String(relapsedDate.getMonth() + 1).padStart(2, '0')}-${String(relapsedDate.getDate()).padStart(2, '0')}`,
        type: 'relapsed',
      },
    ];
    expect(getDayStatus(startDate, 2, events)).toBe('relapsed');
  });
});

describe('getCalendarPage', () => {
  it('returns 0 when fewer than 30 days have elapsed since startDate', () => {
    expect(getCalendarPage(daysAgo(10))).toBe(0);
  });

  it('returns 1 when between 30 and 59 days have elapsed', () => {
    expect(getCalendarPage(daysAgo(45))).toBe(1);
  });

  it('returns 2 when 60 or more days have elapsed', () => {
    expect(getCalendarPage(daysAgo(75))).toBe(2);
  });

  it('clamps to 2 even when more than 90 days have elapsed', () => {
    expect(getCalendarPage(daysAgo(100))).toBe(2);
  });
});

