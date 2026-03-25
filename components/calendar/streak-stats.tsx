import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface StreakStatsProps {
  currentStreakDays: number;
  totalCleanDays: number;
}

export function StreakStats({ currentStreakDays, totalCleanDays }: StreakStatsProps) {
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <ThemedText style={[styles.value, { color: tintColor }]}>
          {currentStreakDays}
        </ThemedText>
        <ThemedText style={[styles.label, { color: secondaryColor }]}>
          {currentStreakDays === 1 ? 'day sober' : 'days sober'}
        </ThemedText>
      </View>
      <View style={[styles.divider, { backgroundColor: secondaryColor }]} />
      <View style={styles.stat}>
        <ThemedText style={[styles.value, { color: tintColor }]}>
          {totalCleanDays}
        </ThemedText>
        <ThemedText style={[styles.label, { color: secondaryColor }]}>
          {totalCleanDays === 1 ? 'total clean day' : 'total clean days'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 40,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontSize: 40,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    lineHeight: 46,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
  },
  divider: {
    width: 1,
    height: 36,
    opacity: 0.25,
  },
});
