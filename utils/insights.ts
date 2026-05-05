import type { CheckInEntry, Round } from '@/types/timer';

export interface MoodCounts {
  struggling: number;
  neutral: number;
  strong: number;
}

export function getMoodCounts(round: Round, checkIns: CheckInEntry[], today: string): MoodCounts {
  const startDate = round.startDate.split('T')[0];
  const endDate = round.endDate ? round.endDate.split('T')[0] : today;

  const counts: MoodCounts = { struggling: 0, neutral: 0, strong: 0 };

  for (const checkIn of checkIns) {
    if (checkIn.date >= startDate && checkIn.date <= endDate) {
      counts[checkIn.mood]++;
    }
  }

  return counts;
}
