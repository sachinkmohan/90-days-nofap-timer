import { getHistoryDays } from '@/utils/history';
import type { Round, CheckInEntry } from '@/types/timer';

function makeRound(overrides: Partial<Round> = {}): Round {
  return {
    id: 'r1',
    roundNumber: 1,
    startDate: '2026-04-01T00:00:00.000Z',
    endDate: null,
    relapses: [],
    ...overrides,
  };
}

describe('getHistoryDays', () => {
  it('returns empty array when round is null', () => {
    expect(getHistoryDays(null, [])).toEqual([]);
  });

  it('returns empty array when round has no relapses and no check-ins', () => {
    expect(getHistoryDays(makeRound(), [])).toEqual([]);
  });

  it('returns a day entry with relapses for a relapse day', () => {
    const round = makeRound({
      relapses: [{ timestamp: '2026-04-10T14:00:00.000Z', relapseCountThatDay: 1 }],
    });
    const days = getHistoryDays(round, []);
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe('2026-04-10');
    expect(days[0].relapses).toHaveLength(1);
    expect(days[0].checkIn).toBeNull();
  });

  it('returns a day entry with checkIn for a check-in-only day', () => {
    const checkIn: CheckInEntry = { date: '2026-04-11', mood: 'strong' };
    const days = getHistoryDays(makeRound(), [checkIn]);
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe('2026-04-11');
    expect(days[0].relapses).toHaveLength(0);
    expect(days[0].checkIn).toEqual(checkIn);
  });

  it('merges relapse and check-in on the same day', () => {
    const round = makeRound({
      relapses: [{ timestamp: '2026-04-10T14:00:00.000Z', relapseCountThatDay: 1 }],
    });
    const checkIn: CheckInEntry = { date: '2026-04-10', mood: 'struggling', note: 'rough day' };
    const days = getHistoryDays(round, [checkIn]);
    expect(days).toHaveLength(1);
    expect(days[0].relapses).toHaveLength(1);
    expect(days[0].checkIn).toEqual(checkIn);
  });

  it('sorts days newest-first', () => {
    const round = makeRound({
      relapses: [
        { timestamp: '2026-04-05T10:00:00.000Z', relapseCountThatDay: 1 },
        { timestamp: '2026-04-15T10:00:00.000Z', relapseCountThatDay: 1 },
      ],
    });
    const days = getHistoryDays(round, []);
    expect(days[0].date).toBe('2026-04-15');
    expect(days[1].date).toBe('2026-04-05');
  });
});
