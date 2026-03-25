import { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimerDisplay } from '@/components/timer/timer-display';
import { ProgressBar } from '@/components/timer/progress-bar';
import { ResetButton } from '@/components/timer/reset-button';
import { StreakStats } from '@/components/calendar/streak-stats';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TimerScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const {
    countdown,
    isLoading,
    celebrationShown,
    markCelebrationShown,
    startDate,
    calendarStartDate,
    calendarEvents,
    totalCleanDays,
  } = useTimer();

  // Redirect to onboarding if not yet completed
  useEffect(() => {
    if (!isLoading && !startDate) {
      router.replace('/onboarding');
    }
  }, [isLoading, startDate, router]);

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StreakStats
          currentStreakDays={countdown.days}
          totalCleanDays={totalCleanDays}
        />
        {calendarStartDate && (
          <CalendarGrid startDate={calendarStartDate} calendarEvents={calendarEvents} />
        )}
        <View style={styles.timerSection}>
          <TimerDisplay countdown={countdown} />
          <ProgressBar
            progress={countdown.progress}
            currentDays={countdown.days}
            hasReached90Days={countdown.hasReached90Days}
          />
        </View>
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 16,
  },
});
