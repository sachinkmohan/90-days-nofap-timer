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

    setTapTimes((prev) => {
      const now = Date.now();
      const recent = [...prev, now].filter((t) => now - t < timeWindow);

      if (recent.length >= tapsRequired) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        callback();
        return [];
      }

      return recent;
    });
  }, [callback, enabled, tapsRequired, timeWindow]);

  return { handlePress };
}
