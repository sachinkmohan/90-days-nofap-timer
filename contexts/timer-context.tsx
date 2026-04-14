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
import { getDayInRound, getDaysSinceLastRelapse, getRelapseCountToday } from '@/utils/rounds';
import { shouldSkipOnboarding } from '@/utils/onboarding';
import { isSameDay } from 'date-fns';
import type { Round, CheckInEntry } from '@/types/timer';

interface TimerContextValue {
  // Round state
  currentRound: Round | null;
  roundNumber: number;
  dayInRound: number;
  daysSinceLastRelapse: number | null;
  lastRelapseTimestamp: string | null;
  relapseCountToday: number;
  // Check-in state
  checkIns: CheckInEntry[];
  todayCheckIn: CheckInEntry | null;
  // App state
  isLoading: boolean;
  // Dev mode state
  isDevMode: boolean;
  devStartDate: Date | null;
  // Actions
  completeOnboarding: (chosenDate: Date) => Promise<void>;
  logRelapse: () => Promise<void>;
  finishRound: () => Promise<void>;
  startNewRound: () => Promise<void>;
  saveCheckIn: (entry: CheckInEntry) => Promise<void>;
  // Dev mode actions
  enterDevMode: (devDate: Date) => Promise<void>;
  exitDevMode: () => Promise<void>;
  setDevStartDate: (date: Date) => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dev mode state
  const [isDevMode, setIsDevMode] = useState(false);
  const [devStartDate, setDevStartDateState] = useState<Date | null>(null);
  const [realRound, setRealRound] = useState<Round | null>(null);

  const effectiveRound = isDevMode
    ? currentRound
      ? { ...currentRound, startDate: devStartDate?.toISOString() ?? currentRound.startDate }
      : null
    : currentRound;

  // Derived values
  const dayInRound = effectiveRound ? getDayInRound(effectiveRound.startDate) : 1;
  const relapses = effectiveRound?.relapses ?? [];
  const daysSinceLastRelapse = getDaysSinceLastRelapse(relapses);
  const relapseCountToday = getRelapseCountToday(relapses);
  const lastRelapseTimestamp = relapses.length > 0
    ? relapses.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b).timestamp
    : null;
  const today = new Date().toISOString().split('T')[0];
  const todayCheckIn = checkIns.find((c) => c.date === today) ?? null;

  useEffect(() => {
    async function initialize() {
      setIsLoading(true);

      // Wipe old data model on first load (no real users yet)
      const rounds = await StorageService.getRounds();
      if (rounds.length === 0) {
        await StorageService.clearAllData();
      }

      const freshRounds = await StorageService.getRounds();
      const activeRound = freshRounds.findLast((r) => r.endDate === null) ?? null;
      setCurrentRound(activeRound);

      const storedCheckIns = await StorageService.getCheckIns();
      setCheckIns(storedCheckIns);

      const devModeState = await DevStorageService.getDevMode();
      if (devModeState?.isActive) {
        setIsDevMode(true);
        setDevStartDateState(new Date(devModeState.devStartDate));
        setRealRound(activeRound);
      }

      setIsLoading(false);
    }

    initialize();
  }, []);

  const completeOnboarding = useCallback(async (chosenDate: Date) => {
    if (await shouldSkipOnboarding(null, StorageService.hasCompletedOnboarding)) return;

    await StorageService.clearAllData();

    const rounds = await StorageService.getRounds();
    // Create first round anchored to the chosen date
    const round: Round = {
      id: generateUUID(),
      roundNumber: rounds.length + 1,
      startDate: chosenDate.toISOString(),
      endDate: null,
      relapses: [],
    };
    const allRounds = [...rounds, round];
    // Persist via startNewRound-equivalent inline to use chosen date
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem('@rounds', JSON.stringify(allRounds));

    await StorageService.markOnboardingComplete();
    setCurrentRound(round);
  }, []);

  const logRelapse = useCallback(async () => {
    if (!currentRound) return;
    const countToday = getRelapseCountToday(currentRound.relapses);
    const event = {
      timestamp: new Date().toISOString(),
      relapseCountThatDay: countToday + 1,
    };
    await StorageService.saveRelapse(currentRound.id, event);
    setCurrentRound((prev) =>
      prev ? { ...prev, relapses: [...prev.relapses, event] } : prev
    );
  }, [currentRound]);

  const finishRound = useCallback(async () => {
    if (!currentRound) return;
    const endDate = new Date().toISOString();
    await StorageService.completeRound(currentRound.id, endDate);
    setCurrentRound((prev) => prev ? { ...prev, endDate } : prev);
  }, [currentRound]);

  const startNewRound = useCallback(async () => {
    const round = await StorageService.startNewRound();
    setCurrentRound(round);
  }, []);

  const saveCheckIn = useCallback(async (entry: CheckInEntry) => {
    await StorageService.saveCheckIn(entry);
    setCheckIns((prev) => {
      const idx = prev.findIndex((c) => c.date === entry.date);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = entry;
        return updated;
      }
      return [...prev, entry];
    });
  }, []);

  // Dev mode actions
  const enterDevMode = useCallback(async (devDate: Date) => {
    setRealRound(currentRound);
    setDevStartDateState(devDate);
    setIsDevMode(true);
    await DevStorageService.setDevMode({
      isActive: true,
      devStartDate: devDate.toISOString(),
      activatedAt: new Date().toISOString(),
    });
  }, [currentRound]);

  const exitDevMode = useCallback(async () => {
    setCurrentRound(realRound);
    setIsDevMode(false);
    setDevStartDateState(null);
    setRealRound(null);
    await DevStorageService.clearDevMode();
  }, [realRound]);

  const setDevStartDate = useCallback(async (date: Date) => {
    setDevStartDateState(date);
    await DevStorageService.setDevMode({
      isActive: true,
      devStartDate: date.toISOString(),
      activatedAt: new Date().toISOString(),
    });
  }, []);

  return (
    <TimerContext.Provider
      value={{
        currentRound,
        roundNumber: currentRound?.roundNumber ?? 1,
        dayInRound,
        daysSinceLastRelapse,
        lastRelapseTimestamp,
        relapseCountToday,
        checkIns,
        todayCheckIn,
        isLoading,
        isDevMode,
        devStartDate,
        completeOnboarding,
        logRelapse,
        finishRound,
        startNewRound,
        saveCheckIn,
        enterDevMode,
        exitDevMode,
        setDevStartDate,
      }}
    >
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
