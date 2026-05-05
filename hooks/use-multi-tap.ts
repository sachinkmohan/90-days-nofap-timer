import { useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

interface UseMultiTapOptions {
  tapsRequired?: number;
  timeWindow?: number;
  enabled?: boolean;
}

export function useMultiTap(
  callback: () => void,
  options?: UseMultiTapOptions
) {
  const {
    tapsRequired = 5,
    timeWindow = 2000,
    enabled = true,
  } = options || {};

  const tapTimesRef = useRef<number[]>([]);

  const handlePress = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    const recent = [...tapTimesRef.current, now].filter((t) => now - t < timeWindow);

    if (recent.length >= tapsRequired) {
      tapTimesRef.current = [];
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(callback, 0);
    } else {
      tapTimesRef.current = recent;
    }
  }, [callback, enabled, tapsRequired, timeWindow]);

  return { handlePress };
}
