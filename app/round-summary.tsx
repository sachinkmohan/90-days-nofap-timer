import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getLongestCleanStreak, getRoundComparison } from '@/utils/round-summary';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoundSummaryScreen() {
  const router = useRouter();
  const { currentRound, allRounds, finishRound, startNewRound } = useTimer();
  const isStartingRound = useRef(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const border = useThemeColor({}, 'border');
  const secondary = useThemeColor({}, 'timerSecondary');
  const tint = useThemeColor({}, 'tint');
  const celebration = useThemeColor({}, 'celebration');

  useEffect(() => {
    if (!currentRound) {
      router.replace('/(tabs)');
    }
  }, [currentRound, router]);

  if (!currentRound) return null;

  const totalRelapses = currentRound.relapses.length;
  const longestStreak = getLongestCleanStreak(currentRound.relapses, currentRound.startDate, 90);
  const comparison = getRoundComparison(allRounds);

  const handleStartNextRound = async () => {
    if (isStartingRound.current) return;
    isStartingRound.current = true;
    try {
      await finishRound();
      await startNewRound();
      router.replace('/(tabs)');
    } finally {
      isStartingRound.current = false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: celebration }]}>
          Round {currentRound.roundNumber} complete
        </ThemedText>

        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: border }]}>
          <View style={styles.stat}>
            <ThemedText style={[styles.statValue]}>{totalRelapses}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondary }]}>
              {totalRelapses === 1 ? 'relapse' : 'relapses'} this round
            </ThemedText>
          </View>

          <View style={[styles.divider, { backgroundColor: border }]} />

          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{longestStreak}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondary }]}>
              longest clean streak (days)
            </ThemedText>
          </View>
        </View>

        {comparison !== null && (
          <View style={[styles.comparison, { backgroundColor: cardBackground, borderColor: border }]}>
            <ThemedText style={[styles.comparisonText, { color: secondary }]}>
              Round {currentRound.roundNumber - 1}: {comparison.prevRelapses}{' '}
              {comparison.prevRelapses === 1 ? 'relapse' : 'relapses'} →{' '}
              Round {currentRound.roundNumber}: {comparison.currentRelapses}{' '}
              {comparison.currentRelapses === 1 ? 'relapse' : 'relapses'}
            </ThemedText>
          </View>
        )}

        <Pressable
          style={[styles.button, { backgroundColor: tint }]}
          onPress={handleStartNextRound}
        >
          <ThemedText style={styles.buttonText}>
            Start Round {currentRound.roundNumber + 1}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          style={styles.laterRow}
        >
          <ThemedText style={[styles.laterText, { color: secondary }]}>Maybe later</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: 60,
  },
  statLabel: {
    fontSize: 14,
  },
  divider: {
    height: 1,
  },
  comparison: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  comparisonText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  laterRow: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  laterText: {
    fontSize: 14,
  },
});
