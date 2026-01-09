import { useState, useRef } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTimer } from '@/contexts/timer-context';

interface ResetButtonProps {
  onReset: () => void;
}

const HOLD_DURATION = 500; // ms to hold before triggering

export function ResetButton({ onReset }: ResetButtonProps) {
  const { isDevMode } = useTimer();
  const buttonColor = useThemeColor({}, 'resetButton');
  const pressedColor = useThemeColor({}, 'resetButtonPressed');

  const [isPressed, setIsPressed] = useState(false);
  const holdProgress = useSharedValue(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    if (isDevMode) return; // Disabled in dev mode
    setIsPressed(true);
    holdProgress.value = withTiming(1, { duration: HOLD_DURATION });

    holdTimerRef.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onReset();
      setIsPressed(false);
      holdProgress.value = 0;
    }, HOLD_DURATION);
  };

  const handlePressOut = () => {
    if (isDevMode) return; // Disabled in dev mode
    setIsPressed(false);
    holdProgress.value = withTiming(0, { duration: 100 });

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${holdProgress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDevMode}
        style={[
          styles.button,
          { backgroundColor: isPressed ? pressedColor : buttonColor },
          isDevMode && styles.disabledButton,
        ]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: pressedColor },
            animatedFillStyle,
          ]}
        />
        <ThemedText style={[styles.buttonText, isDevMode && styles.disabledText]}>
          {isPressed ? 'Hold to reset...' : 'Reset'}
        </ThemedText>
      </Pressable>
      <ThemedText style={styles.hint}>
        {isDevMode ? 'Exit dev mode to reset' : 'Press and hold to reset timer'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledText: {},
});
