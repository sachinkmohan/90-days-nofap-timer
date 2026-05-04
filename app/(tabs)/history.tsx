import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getHistoryDays, type HistoryDay } from '@/utils/history';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOOD_EMOJI = { struggling: '😤', neutral: '😐', strong: '💪' } as const;

function HistoryItem({ item }: { item: HistoryDay }) {
  const [expanded, setExpanded] = useState(false);

  const cardBackground = useThemeColor({}, 'cardBackground');
  const border = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const relapsedColor = useThemeColor({}, 'resetButtonPressed');

  const hasRelapse = item.relapses.length > 0;
  const hasCheckIn = item.checkIn !== null;

  const dateLabel = new Date(item.date + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable
      style={[styles.item, { backgroundColor: cardBackground, borderColor: border }]}
      onPress={() => (hasCheckIn && item.checkIn?.note) ? setExpanded((e) => !e) : undefined}
    >
      <View style={styles.itemRow}>
        {hasRelapse ? (
          <View style={[styles.dot, { backgroundColor: relapsedColor }]} />
        ) : (
          <View style={[styles.dot, { backgroundColor: '#4ADE80' }]} />
        )}
        <View style={styles.itemContent}>
          <ThemedText style={styles.itemDate}>{dateLabel}</ThemedText>

          {hasRelapse && (
            <ThemedText style={[styles.relapseInfo, { color: relapsedColor }]}>
              {item.relapses.length} {item.relapses.length === 1 ? 'relapse' : 'relapses'}
            </ThemedText>
          )}

          {hasCheckIn && (
            <View style={styles.checkInRow}>
              <ThemedText style={[styles.checkInText, { color: secondaryColor }]}>
                {MOOD_EMOJI[item.checkIn!.mood]}{' '}
                {item.checkIn!.note && !expanded
                  ? item.checkIn!.note.slice(0, 60) + (item.checkIn!.note.length > 60 ? '…' : '')
                  : !item.checkIn!.note
                  ? item.checkIn!.mood.charAt(0).toUpperCase() + item.checkIn!.mood.slice(1)
                  : ''}
              </ThemedText>
            </View>
          )}

          {expanded && item.checkIn?.note && (
            <ThemedText style={[styles.noteExpanded, { color: secondaryColor }]}>
              {item.checkIn.note}
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const { currentRound, checkIns } = useTimer();
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'timerSecondary');

  const days = getHistoryDays(currentRound, checkIns);
  const relapseCount = currentRound?.relapses.length ?? 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>History</ThemedText>
        {relapseCount > 0 && (
          <ThemedText style={[styles.count, { color: secondaryColor }]}>
            {relapseCount} {relapseCount === 1 ? 'relapse' : 'relapses'}
          </ThemedText>
        )}
      </View>
      <FlatList
        data={days}
        keyExtractor={(item) => item.date}
        contentContainerStyle={days.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
              No entries yet. Keep going!
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => <HistoryItem item={item} />}
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
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 8 },
  emptyList: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '500',
  },
  relapseInfo: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkInRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInText: {
    fontSize: 13,
    flex: 1,
  },
  noteExpanded: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
