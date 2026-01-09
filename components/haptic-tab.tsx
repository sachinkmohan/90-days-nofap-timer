import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMultiTap } from '@/hooks/use-multi-tap';

export function HapticTab(props: BottomTabBarButtonProps) {
  const router = useRouter();

  // Check if this is the History tab
  const isHistoryTab = props.href?.includes('history') || false;

  // Multi-tap detection for dev mode (History tab only, __DEV__ only)
  const { handlePress: handleMultiTap } = useMultiTap(
    () => {
      router.push('/dev-menu-modal');
    },
    { tapsRequired: 5, timeWindow: 2000, enabled: __DEV__ && isHistoryTab }
  );

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Multi-tap detection (only on History tab in dev mode)
        if (__DEV__ && isHistoryTab) {
          handleMultiTap();
        }

        props.onPressIn?.(ev);
      }}
    />
  );
}
