import { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimerDisplay } from '@/components/timer/timer-display';
import { ProgressBar } from '@/components/timer/progress-bar';
import { ResetButton } from '@/components/timer/reset-button';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TimerScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const { countdown, isLoading, celebrationShown, markCelebrationShown } =
    useTimer();

  // Show celebration modal when 90 days is reached for the first time
  useEffect(() => {
    if (countdown.hasReached90Days && !celebrationShown && !isLoading) {
      markCelebrationShown();
      router.push('/celebration-modal');
    }
  }, [countdown.hasReached90Days, celebrationShown, isLoading, markCelebrationShown, router]);

  const handleReset = () => {
    router.push('/reset-modal');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.content}>
        <TimerDisplay countdown={countdown} />
        <ProgressBar
          progress={countdown.progress}
          hasReached90Days={countdown.hasReached90Days}
        />
      </View>
      <ResetButton onReset={handleReset} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
