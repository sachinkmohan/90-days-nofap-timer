import { differenceInHours, isSameDay } from 'date-fns';
import type { RelapseEvent } from '@/types/timer';

export type RelapseCardDisplayMode = 'none' | 'precise' | 'days';

export function getRelapsesForDay(relapses: RelapseEvent[], date: string): number {
  const target = new Date(date);
  return relapses.filter((r) => isSameDay(new Date(r.timestamp), target)).length;
}

export function getRelapseMessage(relapseCountToday: number): string | null {
  if (relapseCountToday === 0) return "One setback doesn't define your journey. If you feel the urge to go again today, that's the chaser effect. It passes.";
  if (relapseCountToday === 1) return "What you're feeling right now is the chaser effect. It's strongest in the next few hours, then it passes. Just get through today.";
  return null;
}

export function getRelapseCardDisplayMode(lastRelapseTimestamp: string | null): RelapseCardDisplayMode {
  if (lastRelapseTimestamp === null) return 'none';
  const hoursSince = differenceInHours(new Date(), new Date(lastRelapseTimestamp));
  return hoursSince < 24 ? 'precise' : 'days';
}
