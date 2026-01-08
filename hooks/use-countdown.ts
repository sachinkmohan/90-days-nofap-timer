import { useState, useEffect } from 'react';
import type { CountdownValue } from '@/types/timer';

const NINETY_DAYS_IN_SECONDS = 90 * 24 * 60 * 60;

function calculateCountdown(startDate: Date | null): CountdownValue {
  if (!startDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      progress: 0,
      hasReached90Days: false,
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);

  if (totalSeconds < 0) {
    // Start date is in the future (shouldn't happen, but handle gracefully)
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      progress: 0,
      hasReached90Days: false,
    };
  }

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const progress = Math.min((totalSeconds / NINETY_DAYS_IN_SECONDS) * 100, 100);
  const hasReached90Days = totalSeconds >= NINETY_DAYS_IN_SECONDS;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    progress,
    hasReached90Days,
  };
}

export function useCountdown(startDate: Date | null): CountdownValue {
  const [countdown, setCountdown] = useState<CountdownValue>(() =>
    calculateCountdown(startDate)
  );

  useEffect(() => {
    // Recalculate immediately when startDate changes
    setCountdown(calculateCountdown(startDate));

    if (!startDate) return;

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  return countdown;
}
