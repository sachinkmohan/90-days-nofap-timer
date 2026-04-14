import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { CheckInCard } from '@/components/timer/checkin-card';
import { ProgressBar } from '@/components/timer/progress-bar';
import { RelapseCard } from '@/components/timer/relapse-card';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';

export default function TimerScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const {
    currentRound,
    dayInRound,
    daysSinceLastRelapse,
    lastRelapseTimestamp,
    todayCheckIn,
    isLoading,
  } = useTimer();

  // Redirect to onboarding if not yet started
  useEffect(() => {
    if (!isLoading && !currentRound) {
      router.replace('/onboarding');
    }
  }, [isLoading, currentRound, router]);

  // Navigate to round summary when day 90 is reached.
  // redirectedToSummary prevents a loop when the user taps "Maybe later".
  // Resets whenever the active round changes so detection works for each new round.
  const [redirectedToSummary, setRedirectedToSummary] = useState(false);
  const lastRoundIdRef = useRef(currentRound?.id);

  useEffect(() => {
    if (currentRound?.id !== lastRoundIdRef.current) {
      lastRoundIdRef.current = currentRound?.id;
      setRedirectedToSummary(false);
      return;
    }
    if (!isLoading && currentRound && dayInRound >= 90 && !currentRound.endDate && !redirectedToSummary) {
      setRedirectedToSummary(true);
      router.push('/round-summary');
    }
  }, [isLoading, currentRound, dayInRound, router, redirectedToSummary]);

  const handleLogRelapse = () => {
    router.push('/relapse-modal');
  };

  const handleCheckIn = () => {
    router.push('/check-in-modal');
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

  if (!currentRound) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <ThemedText style={styles.heroNumber}>Day {dayInRound}</ThemedText>
          <ThemedText style={styles.heroSub}>of 90</ThemedText>
        </View>

        <ProgressBar dayInRound={dayInRound} />

        <RelapseCard
          lastRelapseTimestamp={lastRelapseTimestamp}
          daysSinceLastRelapse={daysSinceLastRelapse}
          onLogRelapse={handleLogRelapse}
        />

        <CheckInCard todayCheckIn={todayCheckIn} onCheckIn={handleCheckIn} />

        <CalendarGrid
          startDate={new Date(currentRound.startDate)}
          relapses={currentRound.relapses}
        />
      </ScrollView>
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
    paddingBottom: 32,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 8,
  },
  heroNumber: {
    fontSize: 72,
    fontWeight: '700',
    lineHeight: 80,
    fontVariant: ['tabular-nums'],
  },
  heroSub: {
    fontSize: 20,
    opacity: 0.5,
    marginTop: -4,
  },
});
