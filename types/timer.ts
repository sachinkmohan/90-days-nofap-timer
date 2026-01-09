export interface TimerState {
  startDate: string; // ISO timestamp when current streak began
}

export interface ResetEntry {
  id: string; // UUID
  resetDate: string; // ISO timestamp
  trigger: string; // Brief note (max 50 chars)
  streakDays: number; // Days achieved before reset
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

export interface DevModeState {
  isActive: boolean;
  devStartDate: string; // ISO timestamp
  activatedAt: string; // ISO timestamp - when dev mode was activated
}
