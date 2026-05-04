import type { CalendarEvent } from '@/types/timer';

export type DayStatus = 'clean' | 'relapsed' | 'today' | 'future';

export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCalendarPage(startDate: Date): 0 | 1 | 2 {
  const today = new Date();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.floor(diffDays / 30), 0), 2) as 0 | 1 | 2;
}

export function getDayStatus(
  startDate: Date,
  dayIndex: number,
  events: CalendarEvent[]
): DayStatus {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayIndex);
  const dayStr = toLocalDateStr(d);
  const todayStr = toLocalDateStr(new Date());

  if (dayStr > todayStr) return 'future';
  if (events.some((e) => e.date === dayStr)) return 'relapsed';
  if (dayStr === todayStr) return 'today';
  return 'clean';
}
