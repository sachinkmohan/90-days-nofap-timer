import { differenceInHours, isSameDay } from 'date-fns';
import type { RelapseEvent } from '@/types/timer';

export type RelapseCardDisplayMode = 'none' | 'precise' | 'days';

export function getRelapsesForDay(relapses: RelapseEvent[], date: string): number {
  const target = new Date(date);
  return relapses.filter((r) => isSameDay(new Date(r.timestamp), target)).length;
}

export function getRelapseCardDisplayMode(lastRelapseTimestamp: string | null): RelapseCardDisplayMode {
  if (lastRelapseTimestamp === null) return 'none';
  const hoursSince = differenceInHours(new Date(), new Date(lastRelapseTimestamp));
  return hoursSince < 24 ? 'precise' : 'days';
}
