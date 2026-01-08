import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ProgressBarProps {
  progress: number; // 0-100
  hasReached90Days: boolean;
}

export function ProgressBar({ progress, hasReached90Days }: ProgressBarProps) {
  const trackColor = useThemeColor({}, 'progressTrack');
  const fillColor = useThemeColor({}, 'progressFill');
  const celebrationColor = useThemeColor({}, 'celebration');
  const secondaryColor = useThemeColor({}, 'timerSecondary');

  const barColor = hasReached90Days ? celebrationColor : fillColor;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={[styles.label, { color: secondaryColor }]}>
          Progress to 90 days
        </ThemedText>
        <ThemedText style={[styles.percentage, { color: secondaryColor }]}>
          {Math.round(progress)}%
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: `${Math.min(progress, 100)}%`,
            },
          ]}
        />
      </View>
      {hasReached90Days && (
        <ThemedText style={[styles.completeText, { color: celebrationColor }]}>
          Goal achieved! Keep going!
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  completeText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
