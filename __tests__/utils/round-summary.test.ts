import { getLongestCleanStreak, getRoundComparison, getRoundDuration } from '@/utils/round-summary';
import type { RelapseEvent, Round } from '@/types/timer';

// Helpers
function makeRelapse(daysFromStart: number): RelapseEvent {
  const d = new Date('2026-01-01T12:00:00Z');
  d.setDate(d.getDate() + daysFromStart);
  return { timestamp: d.toISOString(), relapseCountThatDay: 1 };
}

const START = '2026-01-01T00:00:00Z';

describe('getLongestCleanStreak', () => {
  it('returns totalDays when there are no relapses', () => {
    expect(getLongestCleanStreak([], START, 90)).toBe(90);
  });

  it('returns days after relapse when relapse is on day 0', () => {
    expect(getLongestCleanStreak([makeRelapse(0)], START, 90)).toBe(89);
  });

  it('returns days before relapse when relapse is on last day', () => {
    expect(getLongestCleanStreak([makeRelapse(89)], START, 90)).toBe(89);
  });

  it('returns longest gap with one relapse in the middle', () => {
    // relapse on day 10: gap before=10, gap after=79 → longest=79
    expect(getLongestCleanStreak([makeRelapse(10)], START, 90)).toBe(79);
  });

  it('returns longest gap across multiple relapses', () => {
    // relapses on day 5 and day 12:
    // before=5, between=6, after=77 → longest=77
    expect(getLongestCleanStreak([makeRelapse(5), makeRelapse(12)], START, 90)).toBe(77);
  });

  it('treats multiple relapses on the same day as one relapse day', () => {
    // two relapses on day 5 — should behave the same as one
    const r1 = { timestamp: new Date('2026-01-06T09:00:00Z').toISOString(), relapseCountThatDay: 1 };
    const r2 = { timestamp: new Date('2026-01-06T14:00:00Z').toISOString(), relapseCountThatDay: 2 };
    expect(getLongestCleanStreak([r1, r2], START, 90)).toBe(84);
  });
});

describe('getRoundComparison', () => {
  function makeRound(roundNumber: number, relapseCount: number): Round {
    const relapses = Array.from({ length: relapseCount }, (_, i) => makeRelapse(i + 1));
    return {
      id: `round-${roundNumber}`,
      roundNumber,
      startDate: START,
      endDate: null,
      relapses,
    };
  }

  it('returns null when there is only one round', () => {
    expect(getRoundComparison([makeRound(1, 5)])).toBeNull();
  });

  it('returns null when there are no rounds', () => {
    expect(getRoundComparison([])).toBeNull();
  });

  it('returns prev and current relapse counts for round 2', () => {
    const result = getRoundComparison([makeRound(1, 8), makeRound(2, 5)]);
    expect(result).toEqual({ prevRelapses: 8, currentRelapses: 5 });
  });

  it('always compares the last two rounds', () => {
    const result = getRoundComparison([makeRound(1, 10), makeRound(2, 8), makeRound(3, 3)]);
    expect(result).toEqual({ prevRelapses: 8, currentRelapses: 3 });
  });
});

describe('getRoundDuration', () => {
  it('returns 1 when start and end are the same day', () => {
    expect(getRoundDuration('2026-01-01T00:00:00Z', '2026-01-01T23:59:00Z')).toBe(1);
  });

  it('returns 91 for inclusive-day count over a 90-day span', () => {
    expect(getRoundDuration('2026-01-01T00:00:00Z', '2026-04-01T00:00:00Z')).toBe(91);
  });

  it('uses today when endDate is null', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-14T12:00:00Z'));
    // Jan 14 → Apr 14 = 90 days difference → duration = 91 (Jan 14 is day 1)
    expect(getRoundDuration('2026-01-14T00:00:00Z', null)).toBe(91);
    jest.useRealTimers();
  });
});
