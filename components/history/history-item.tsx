import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ResetEntry } from '@/types/timer';

interface HistoryItemProps {
  entry: ResetEntry;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryItem({ entry }: HistoryItemProps) {
  const borderColor = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'timerSecondary');

  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={styles.date}>
          {formatDate(entry.resetDate)}
        </ThemedText>
        <ThemedText style={[styles.streak, { color: secondaryColor }]}>
          {entry.streakDays} {entry.streakDays === 1 ? 'day' : 'days'}
        </ThemedText>
      </View>
      {entry.trigger ? (
        <ThemedText style={[styles.trigger, { color: secondaryColor }]}>
          {entry.trigger}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 15,
    fontWeight: '500',
  },
  streak: {
    fontSize: 14,
  },
  trigger: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
