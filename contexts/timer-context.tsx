import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { StorageService, generateUUID } from '@/services/storage';
import { useCountdown } from '@/hooks/use-countdown';
import type { ResetEntry, CountdownValue } from '@/types/timer';

interface TimerContextValue {
  // State
  startDate: Date | null;
  countdown: CountdownValue;
  history: ResetEntry[];
  isLoading: boolean;
  celebrationShown: boolean;
  // Actions
  resetTimer: (trigger?: string) => Promise<void>;
  markCelebrationShown: () => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [history, setHistory] = useState<ResetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [celebrationShown, setCelebrationShown] = useState(false);

  const countdown = useCountdown(startDate);

  // Initialize on mount
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);

      // Load existing state
      const timerState = await StorageService.getTimerState();
      const resetHistory = await StorageService.getHistory();

      if (timerState) {
        // Existing user - restore state
        const date = new Date(timerState.startDate);
        setStartDate(date);

        // Check if celebration was already shown for this streak
        const shown = await StorageService.hasCelebrationBeenShown(
          timerState.startDate
        );
        setCelebrationShown(shown);
      } else {
        // First launch - start timer now
        const now = new Date();
        const nowISO = now.toISOString();
        await StorageService.setTimerState({ startDate: nowISO });
        setStartDate(now);
        setCelebrationShown(false);
      }

      setHistory(resetHistory);
      setIsLoading(false);
    }

    initialize();
  }, []);

  const resetTimer = useCallback(
    async (trigger?: string) => {
      if (!startDate) return;

      // Calculate days before reset
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();
      const streakDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Create history entry
      const entry: ResetEntry = {
        id: generateUUID(),
        resetDate: now.toISOString(),
        trigger: trigger?.trim().slice(0, 50) || '',
        streakDays,
      };

      await StorageService.addHistoryEntry(entry);

      // Reset timer to now
      const nowISO = now.toISOString();
      await StorageService.setTimerState({ startDate: nowISO });

      // Update state
      setStartDate(now);
      setHistory((prev) => [entry, ...prev]);
      setCelebrationShown(false);
    },
    [startDate]
  );

  const markCelebrationShown = useCallback(async () => {
    if (!startDate) return;
    await StorageService.markCelebrationShown(startDate.toISOString());
    setCelebrationShown(true);
  }, [startDate]);

  return (
    <TimerContext.Provider
      value={{
        startDate,
        countdown,
        history,
        isLoading,
        celebrationShown,
        resetTimer,
        markCelebrationShown,
      }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer(): TimerContextValue {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
