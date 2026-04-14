import { differenceInDays, isSameDay } from 'date-fns';
import type { RelapseEvent } from '@/types/timer';

export function getDayInRound(startDate: string): number {
  const day = differenceInDays(new Date(), new Date(startDate)) + 1;
  return Math.min(day, 90);
}

export function getDaysSinceLastRelapse(relapses: RelapseEvent[]): number | null {
  if (relapses.length === 0) return null;
  const latest = relapses.reduce((a, b) =>
    new Date(a.timestamp) > new Date(b.timestamp) ? a : b
  );
  return differenceInDays(new Date(), new Date(latest.timestamp));
}

export function getRelapseCountToday(relapses: RelapseEvent[]): number {
  const today = new Date();
  return relapses.filter((r) => isSameDay(new Date(r.timestamp), today)).length;
}
