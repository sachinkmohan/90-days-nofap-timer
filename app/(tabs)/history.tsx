import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDistanceToNow } from 'date-fns';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const { currentRound } = useTimer();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const border = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const relapsedColor = useThemeColor({}, 'resetButtonPressed');

  const relapses = currentRound?.relapses ?? [];
  const sorted = [...relapses].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>History</ThemedText>
        {relapses.length > 0 && (
          <ThemedText style={[styles.count, { color: secondaryColor }]}>
            {relapses.length} {relapses.length === 1 ? 'relapse' : 'relapses'}
          </ThemedText>
        )}
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        contentContainerStyle={sorted.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
              No relapses this round. Keep going!
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: cardBackground, borderColor: border }]}>
            <View style={[styles.dot, { backgroundColor: relapsedColor }]} />
            <View style={styles.itemContent}>
              <ThemedText style={styles.itemDate}>
                {new Date(item.timestamp).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </ThemedText>
              <ThemedText style={[styles.itemTime, { color: secondaryColor }]}>
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </ThemedText>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  count: {
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemContent: {
    gap: 2,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemTime: {
    fontSize: 13,
  },
});
