import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

interface UseMultiTapOptions {
  tapsRequired?: number;
  timeWindow?: number;
  enabled?: boolean;
}

/**
 * Custom hook for detecting multiple rapid taps on a component
 * @param callback - Function to call when required taps are detected
 * @param options - Configuration options
 * @returns Object with handlePress function
 */
export function useMultiTap(
  callback: () => void,
  options?: UseMultiTapOptions
) {
  const {
    tapsRequired = 5,
    timeWindow = 2000,
    enabled = true,
  } = options || {};

  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const handlePress = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    let thresholdReached = false;

    setTapTimes((prev) => {
      const recent = [...prev, now].filter((t) => now - t < timeWindow);
      if (recent.length >= tapsRequired) {
        thresholdReached = true;
        return [];
      }
      return recent;
    });

    if (thresholdReached) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(callback, 0);
    }
  }, [callback, enabled, tapsRequired, timeWindow]);

  return { handlePress };
}
