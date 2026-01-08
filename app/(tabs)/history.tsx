import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { HistoryItem } from '@/components/history/history-item';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ResetEntry } from '@/types/timer';

export default function HistoryScreen() {
  const { history } = useTimer();
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'timerSecondary');

  const renderItem = ({ item }: { item: ResetEntry }) => (
    <HistoryItem entry={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
        No resets yet. Keep going!
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>History</ThemedText>
        {history.length > 0 && (
          <ThemedText style={[styles.count, { color: secondaryColor }]}>
            {history.length} {history.length === 1 ? 'reset' : 'resets'}
          </ThemedText>
        )}
      </View>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={history.length === 0 ? styles.emptyList : undefined}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
