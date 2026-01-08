import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { CountdownValue } from '@/types/timer';

interface TimerDisplayProps {
  countdown: CountdownValue;
}

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

export function TimerDisplay({ countdown }: TimerDisplayProps) {
  const timerColor = useThemeColor({}, 'timerText');
  const secondaryColor = useThemeColor({}, 'timerSecondary');

  return (
    <View style={styles.container}>
      <View style={styles.daysContainer}>
        <ThemedText style={[styles.daysNumber, { color: timerColor }]}>
          {countdown.days}
        </ThemedText>
        <ThemedText style={[styles.daysLabel, { color: secondaryColor }]}>
          {countdown.days === 1 ? 'day' : 'days'}
        </ThemedText>
      </View>

      <View style={styles.timeContainer}>
        <ThemedText style={[styles.timeText, { color: secondaryColor }]}>
          {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  daysNumber: {
    fontSize: 120,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    lineHeight: 130,
  },
  daysLabel: {
    fontSize: 32,
    fontWeight: '300',
  },
  timeContainer: {
    marginTop: 8,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
});
