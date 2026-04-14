import { getRelapsesForDay } from '@/utils/relapse-card';
import type { RelapseEvent } from '@/types/timer';

describe('getRelapsesForDay', () => {
  it('returns 0 when there are no relapses', () => {
    expect(getRelapsesForDay([], '2026-04-14')).toBe(0);
  });

  it('returns the count of relapses on the given day', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: '2026-04-14T08:00:00Z', relapseCountThatDay: 1 },
      { timestamp: '2026-04-14T14:00:00Z', relapseCountThatDay: 2 },
      { timestamp: '2026-04-14T20:00:00Z', relapseCountThatDay: 3 },
    ];
    expect(getRelapsesForDay(relapses, '2026-04-14')).toBe(3);
  });

  it('returns 0 when relapses exist but not on the given day', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: '2026-04-12T10:00:00Z', relapseCountThatDay: 1 },
      { timestamp: '2026-04-13T10:00:00Z', relapseCountThatDay: 1 },
    ];
    expect(getRelapsesForDay(relapses, '2026-04-14')).toBe(0);
  });

  it('counts only the matching day when relapses span multiple days', () => {
    const relapses: RelapseEvent[] = [
      { timestamp: '2026-04-13T10:00:00Z', relapseCountThatDay: 1 },
      { timestamp: '2026-04-14T09:00:00Z', relapseCountThatDay: 1 },
      { timestamp: '2026-04-14T17:00:00Z', relapseCountThatDay: 2 },
      { timestamp: '2026-04-15T10:00:00Z', relapseCountThatDay: 1 },
    ];
    expect(getRelapsesForDay(relapses, '2026-04-14')).toBe(2);
  });
});
