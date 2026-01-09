import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { StorageService, generateUUID } from '@/services/storage';
import { DevStorageService } from '@/services/dev-storage';
import { useCountdown } from '@/hooks/use-countdown';
import type { ResetEntry, CountdownValue } from '@/types/timer';

interface TimerContextValue {
  // State
  startDate: Date | null;
  countdown: CountdownValue;
  history: ResetEntry[];
  isLoading: boolean;
  celebrationShown: boolean;
  // Dev mode state
  isDevMode: boolean;
  devStartDate: Date | null;
  // Actions
  resetTimer: (trigger?: string) => Promise<void>;
  markCelebrationShown: () => Promise<void>;
  // Dev mode actions
  enterDevMode: (devDate: Date) => Promise<void>;
  exitDevMode: () => Promise<void>;
  setDevStartDate: (date: Date) => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [history, setHistory] = useState<ResetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [celebrationShown, setCelebrationShown] = useState(false);

  // Dev mode state
  const [isDevMode, setIsDevMode] = useState(false);
  const [devStartDate, setDevStartDate] = useState<Date | null>(null);
  const [realStartDate, setRealStartDate] = useState<Date | null>(null);

  // Use dev start date if in dev mode, otherwise use real start date
  const effectiveStartDate = isDevMode ? devStartDate : startDate;
  const countdown = useCountdown(effectiveStartDate);

  // Initialize on mount
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);

      // Load existing state
      const timerState = await StorageService.getTimerState();
      const resetHistory = await StorageService.getHistory();
      const devModeState = await DevStorageService.getDevMode();

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

      // Restore dev mode state if it exists
      if (devModeState && devModeState.isActive) {
        setIsDevMode(true);
        setDevStartDate(new Date(devModeState.devStartDate));
        setRealStartDate(timerState ? new Date(timerState.startDate) : null);
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

  // Dev mode actions
  const enterDevMode = useCallback(
    async (devDate: Date) => {
      // Save real start date for restoration
      setRealStartDate(startDate);
      setDevStartDate(devDate);
      setIsDevMode(true);

      // Persist dev mode state
      await DevStorageService.setDevMode({
        isActive: true,
        devStartDate: devDate.toISOString(),
        activatedAt: new Date().toISOString(),
      });
    },
    [startDate]
  );

  const exitDevMode = useCallback(async () => {
    // Restore real start date
    if (realStartDate) {
      setStartDate(realStartDate);
    }

    // Clear dev mode state
    setIsDevMode(false);
    setDevStartDate(null);
    setRealStartDate(null);

    // Clear from storage
    await DevStorageService.clearDevMode();
  }, [realStartDate]);

  const setDevStartDateAction = useCallback(async (date: Date) => {
    setDevStartDate(date);

    // Update storage
    await DevStorageService.setDevMode({
      isActive: true,
      devStartDate: date.toISOString(),
      activatedAt: new Date().toISOString(),
    });
  }, []);

  return (
    <TimerContext.Provider
      value={{
        startDate,
        countdown,
        history,
        isLoading,
        celebrationShown,
        isDevMode,
        devStartDate,
        resetTimer,
        markCelebrationShown,
        enterDevMode,
        exitDevMode,
        setDevStartDate: setDevStartDateAction,
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
