import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getLongestCleanStreak, getRoundDuration } from '@/utils/round-summary';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Round } from '@/types/timer';

function RoundCard({ round, isActive }: { round: Round; isActive: boolean }) {
  const cardBackground = useThemeColor({}, 'cardBackground');
  const border = useThemeColor({}, 'border');
  const secondary = useThemeColor({}, 'timerSecondary');
  const tint = useThemeColor({}, 'tint');
  const celebration = useThemeColor({}, 'celebration');

  const duration = getRoundDuration(round.startDate, round.endDate);
  const longestStreak = getLongestCleanStreak(
    round.relapses,
    round.startDate,
    Math.min(duration, 90)
  );
  const totalRelapses = round.relapses.length;

  const startLabel = new Date(round.startDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endLabel = round.endDate
    ? new Date(round.endDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'today';

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor: isActive ? tint : border, borderWidth: isActive ? 2 : 1 }]}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.roundTitle}>Round {round.roundNumber}</ThemedText>
        {isActive && (
          <View style={[styles.activeBadge, { backgroundColor: tint }]}>
            <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
          </View>
        )}
        {!isActive && (
          <View style={[styles.activeBadge, { backgroundColor: celebration }]}>
            <ThemedText style={styles.activeBadgeText}>Complete</ThemedText>
          </View>
        )}
      </View>

      <ThemedText style={[styles.dateRange, { color: secondary }]}>
        {startLabel} – {endLabel}
      </ThemedText>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <ThemedText style={styles.statValue}>{totalRelapses}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondary }]}>
            {totalRelapses === 1 ? 'relapse' : 'relapses'}
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.stat}>
          <ThemedText style={styles.statValue}>{longestStreak}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondary }]}>
            longest streak
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.stat}>
          <ThemedText style={styles.statValue}>{Math.min(duration, 90)}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondary }]}>
            days
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const { allRounds, currentRound } = useTimer();
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'timerSecondary');

  const sorted = [...allRounds].reverse();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Insights</ThemedText>
        {allRounds.length > 0 && (
          <ThemedText style={[styles.count, { color: secondaryColor }]}>
            {allRounds.length} {allRounds.length === 1 ? 'round' : 'rounds'}
          </ThemedText>
        )}
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={sorted.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
              Complete your first round to see insights.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <RoundCard round={item} isActive={item.id === currentRound?.id} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 28, fontWeight: '700' },
  count: { fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  emptyList: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundTitle: { fontSize: 18, fontWeight: '700' },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  dateRange: { fontSize: 13 },
  stats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 11, textAlign: 'center' },
  statDivider: { width: 1, marginVertical: 4 },
});
