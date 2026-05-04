export type NotificationPreset = 'morning' | 'afternoon' | 'evening';

export const MILESTONES = [7, 14, 30, 60] as const;
export type MilestoneDays = (typeof MILESTONES)[number];

export function getPresetHour(preset: NotificationPreset): number {
  const hours: Record<NotificationPreset, number> = {
    morning: 8,
    afternoon: 14,
    evening: 20,
  };
  return hours[preset];
}

export function getDailyNotificationBody(dayInRound: number): string {
  return `Day ${dayInRound} — tap to check in`;
}

export function getMilestoneReached(daysSinceLastRelapse: number): MilestoneDays | null {
  return (MILESTONES as readonly number[]).includes(daysSinceLastRelapse)
    ? (daysSinceLastRelapse as MilestoneDays)
    : null;
}

export function getMilestoneNotificationBody(days: MilestoneDays): string {
  return `${days} days since your last relapse. Keep going.`;
}
