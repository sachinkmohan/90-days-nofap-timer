import { differenceInDays } from 'date-fns';
import type { RelapseEvent, Round } from '@/types/timer';

export function getLongestCleanStreak(
  relapses: RelapseEvent[],
  startDate: string,
  totalDays: number = 90
): number {
  if (relapses.length === 0) return totalDays;

  const start = new Date(startDate);

  // Get unique relapse day indices (0-based from round start), sorted
  const relapseDays = [...new Set(
    relapses.map((r) => differenceInDays(new Date(r.timestamp), start))
  )].sort((a, b) => a - b);

  let maxStreak = 0;

  // Gap before first relapse
  maxStreak = Math.max(maxStreak, relapseDays[0]);

  // Gaps between consecutive relapse days
  for (let i = 1; i < relapseDays.length; i++) {
    maxStreak = Math.max(maxStreak, relapseDays[i] - relapseDays[i - 1] - 1);
  }

  // Gap after last relapse to end
  maxStreak = Math.max(maxStreak, totalDays - relapseDays[relapseDays.length - 1] - 1);

  return maxStreak;
}

export function getRoundDuration(startDate: string, endDate: string | null): number {
  const end = endDate ? new Date(endDate) : new Date();
  return differenceInDays(end, new Date(startDate)) + 1;
}

export function getRoundComparison(
  rounds: Round[]
): { prevRelapses: number; currentRelapses: number } | null {
  if (rounds.length < 2) return null;
  const current = rounds[rounds.length - 1];
  const prev = rounds[rounds.length - 2];
  return {
    prevRelapses: prev.relapses.length,
    currentRelapses: current.relapses.length,
  };
}
