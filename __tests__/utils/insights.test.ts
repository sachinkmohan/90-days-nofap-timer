import { getMoodCounts } from '@/utils/insights';
import type { CheckInEntry, Round } from '@/types/timer';

function makeRound(startDate: string, endDate: string | null = null): Round {
  return {
    id: 'r1',
    roundNumber: 1,
    startDate,
    endDate,
    relapses: [],
  };
}

function makeCheckIn(date: string, mood: CheckInEntry['mood']): CheckInEntry {
  return { date, mood };
}

const START = '2026-01-01T00:00:00Z'; // date part: 2026-01-01
const END = '2026-03-31T00:00:00Z';   // date part: 2026-03-31

describe('getMoodCounts', () => {
  const TODAY = '2026-05-05';

  it('returns all zeros when checkIns is empty', () => {
    const round = makeRound(START, END);
    expect(getMoodCounts(round, [], TODAY)).toEqual({ struggling: 0, neutral: 0, strong: 0 });
  });

  it('excludes check-ins outside the round date range', () => {
    const round = makeRound(START, END);
    const checkIns = [
      makeCheckIn('2025-12-31', 'strong'),  // before start
      makeCheckIn('2026-04-01', 'strong'),  // after end
    ];
    expect(getMoodCounts(round, checkIns, TODAY)).toEqual({ struggling: 0, neutral: 0, strong: 0 });
  });

  it('counts a single check-in within the range', () => {
    const round = makeRound(START, END);
    const checkIns = [makeCheckIn('2026-02-15', 'strong')];
    expect(getMoodCounts(round, checkIns, TODAY)).toEqual({ struggling: 0, neutral: 0, strong: 1 });
  });

  it('includes a check-in on the exact start date', () => {
    const round = makeRound(START, END);
    const checkIns = [makeCheckIn('2026-01-01', 'neutral')];
    expect(getMoodCounts(round, checkIns, TODAY)).toEqual({ struggling: 0, neutral: 1, strong: 0 });
  });

  it('includes a check-in on the exact end date', () => {
    const round = makeRound(START, END);
    const checkIns = [makeCheckIn('2026-03-31', 'strong')];
    expect(getMoodCounts(round, checkIns, TODAY)).toEqual({ struggling: 0, neutral: 0, strong: 1 });
  });

  it('uses the supplied today as the upper bound for an active round with no endDate', () => {
    const round = makeRound(START, null);
    const checkIns = [makeCheckIn('2026-05-05', 'strong')];
    expect(getMoodCounts(round, checkIns, '2026-05-05')).toEqual({ struggling: 0, neutral: 0, strong: 1 });
  });

  it('excludes check-ins after the supplied today for an active round', () => {
    const round = makeRound(START, null);
    const checkIns = [makeCheckIn('2026-05-06', 'strong')];
    expect(getMoodCounts(round, checkIns, '2026-05-05')).toEqual({ struggling: 0, neutral: 0, strong: 0 });
  });

  it('counts all three moods correctly across multiple check-ins', () => {
    const round = makeRound(START, END);
    const checkIns = [
      makeCheckIn('2026-01-10', 'struggling'),
      makeCheckIn('2026-01-11', 'struggling'),
      makeCheckIn('2026-01-12', 'neutral'),
      makeCheckIn('2026-02-01', 'strong'),
      makeCheckIn('2026-02-02', 'strong'),
      makeCheckIn('2026-02-03', 'strong'),
    ];
    expect(getMoodCounts(round, checkIns, TODAY)).toEqual({ struggling: 2, neutral: 1, strong: 3 });
  });
});
