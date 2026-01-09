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
    const recentTaps = [...tapTimes, now].filter(
      (time) => now - time < timeWindow
    );

    if (recentTaps.length >= tapsRequired) {
      // Success! Trigger callback with haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      callback();
      setTapTimes([]);
    } else {
      // Update tap times
      setTapTimes(recentTaps);
    }
  }, [tapTimes, callback, enabled, tapsRequired, timeWindow]);

  return { handlePress };
}
