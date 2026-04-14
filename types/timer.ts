export interface RelapseEvent {
  timestamp: string; // ISO timestamp
  relapseCountThatDay: number; // 1 for first relapse of day, 2 for second, etc.
}

export interface Round {
  id: string;
  roundNumber: number;
  startDate: string; // ISO timestamp
  endDate: string | null; // ISO timestamp when round completed, null if active
  relapses: RelapseEvent[];
}

export interface CheckInEntry {
  date: string; // 'YYYY-MM-DD'
  mood: 'struggling' | 'neutral' | 'strong';
  note?: string;
}

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  progress: number; // 0-100 representing % toward 90 days
  hasReached90Days: boolean;
}

export interface CalendarEvent {
  date: string; // 'YYYY-MM-DD'
  type: 'relapsed';
}

export interface DevModeState {
  isActive: boolean;
  devStartDate: string; // ISO timestamp
  activatedAt: string; // ISO timestamp - when dev mode was activated
}
