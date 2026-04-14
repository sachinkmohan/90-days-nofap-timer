import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getRelapseCardDisplayMode } from '@/utils/relapse-card';
import { formatDistanceToNow } from 'date-fns';
import { Pressable, StyleSheet, View } from 'react-native';

interface RelapseCardProps {
  lastRelapseTimestamp: string | null;
  daysSinceLastRelapse: number | null;
  onLogRelapse: () => void;
}

export function RelapseCard({
  lastRelapseTimestamp,
  daysSinceLastRelapse,
  onLogRelapse,
}: RelapseCardProps) {
  const cardBg = useThemeColor({}, 'cardBackground');
  const border = useThemeColor({}, 'border');
  const secondary = useThemeColor({}, 'timerSecondary');
  const tint = useThemeColor({}, 'tint');

  const mode = getRelapseCardDisplayMode(lastRelapseTimestamp);

  const statusText =
    mode === 'none'
      ? 'No relapses this round 💪'
      : mode === 'precise'
        ? `Last relapse ${formatDistanceToNow(new Date(lastRelapseTimestamp!), { addSuffix: true })}`
        : `${daysSinceLastRelapse} ${daysSinceLastRelapse === 1 ? 'day' : 'days'} since last relapse`;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <ThemedText style={[styles.status, { color: secondary }]}>{statusText}</ThemedText>
      <Pressable
        onPress={onLogRelapse}
        style={styles.action}
        accessibilityRole="button"
        accessibilityLabel="Log a relapse"
      >
        <ThemedText style={[styles.actionText, { color: tint }]}>Log a relapse →</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  action: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
