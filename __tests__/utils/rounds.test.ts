import { getDayInRound, getDaysSinceLastRelapse, getRelapseCountToday } from '@/utils/rounds';
import type { RelapseEvent } from '@/types/timer';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-04-14T12:00:00Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

describe('getDayInRound', () => {
  it('returns 1 on the day the round started', () => {
    expect(getDayInRound(daysAgo(0))).toBe(1);
  });

  it('returns 2 after one full day', () => {
    expect(getDayInRound(daysAgo(1))).toBe(2);
  });

  it('returns 47 after 46 days', () => {
    expect(getDayInRound(daysAgo(46))).toBe(47);
  });

  it('returns 90 after 89 days', () => {
    expect(getDayInRound(daysAgo(89))).toBe(90);
  });

  it('clamps to 90 when round has gone past 90 days', () => {
    expect(getDayInRound(daysAgo(100))).toBe(90);
  });
});

describe('getDaysSinceLastRelapse', () => {
  it('returns null when there are no relapses', () => {
    expect(getDaysSinceLastRelapse([])).toBeNull();
  });

  it('returns 0 when the last relapse was today', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: hoursAgo(2), relapseCountThatDay: 1 },
    ];
    expect(getDaysSinceLastRelapse(relapses)).toBe(0);
  });

  it('returns 1 when the last relapse was yesterday', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: daysAgo(1), relapseCountThatDay: 1 },
    ];
    expect(getDaysSinceLastRelapse(relapses)).toBe(1);
  });

  it('returns the most recent relapse when there are multiple', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: daysAgo(5), relapseCountThatDay: 1 },
      { timestamp: daysAgo(2), relapseCountThatDay: 1 },
    ];
    expect(getDaysSinceLastRelapse(relapses)).toBe(2);
  });
});

describe('getRelapseCountToday', () => {
  it('returns 0 when there are no relapses', () => {
    expect(getRelapseCountToday([])).toBe(0);
  });

  it('returns 0 when all relapses were on previous days', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: daysAgo(1), relapseCountThatDay: 1 },
      { timestamp: daysAgo(3), relapseCountThatDay: 1 },
    ];
    expect(getRelapseCountToday(relapses)).toBe(0);
  });

  it('returns 1 when there is one relapse today', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: hoursAgo(2), relapseCountThatDay: 1 },
    ];
    expect(getRelapseCountToday(relapses)).toBe(1);
  });

  it('returns 3 when there are three relapses today', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: hoursAgo(5), relapseCountThatDay: 1 },
      { timestamp: hoursAgo(3), relapseCountThatDay: 2 },
      { timestamp: hoursAgo(1), relapseCountThatDay: 3 },
    ];
    expect(getRelapseCountToday(relapses)).toBe(3);
  });

  it('counts only today relapses when mixed with older ones', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: daysAgo(2), relapseCountThatDay: 1 },
      { timestamp: hoursAgo(4), relapseCountThatDay: 1 },
      { timestamp: hoursAgo(1), relapseCountThatDay: 2 },
    ];
    expect(getRelapseCountToday(relapses)).toBe(2);
  });
});
