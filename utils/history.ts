import type { Round, RelapseEvent, CheckInEntry } from '@/types/timer';

export interface HistoryDay {
  date: string; // 'YYYY-MM-DD'
  relapses: RelapseEvent[];
  checkIn: CheckInEntry | null;
}

export function getHistoryDays(
  round: Round | null,
  checkIns: CheckInEntry[]
): HistoryDay[] {
  if (!round) return [];

  const dayMap = new Map<string, HistoryDay>();

  for (const relapse of round.relapses) {
    const date = relapse.timestamp.split('T')[0];
    if (!dayMap.has(date)) {
      dayMap.set(date, { date, relapses: [], checkIn: null });
    }
    dayMap.get(date)!.relapses.push(relapse);
  }

  for (const checkIn of checkIns) {
    if (!dayMap.has(checkIn.date)) {
      dayMap.set(checkIn.date, { date: checkIn.date, relapses: [], checkIn: null });
    }
    dayMap.get(checkIn.date)!.checkIn = checkIn;
  }

  return [...dayMap.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
