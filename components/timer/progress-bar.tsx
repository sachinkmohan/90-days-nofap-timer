import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ProgressBarProps {
  progress: number; // 0-100
  currentDays: number;
  hasReached90Days: boolean;
}

const MILESTONES = [7, 14, 30, 60, 90];
const MILESTONE_POSITIONS = MILESTONES.map((day) => (day / 90) * 100);

export function ProgressBar({
  progress,
  currentDays,
  hasReached90Days,
}: ProgressBarProps) {
  const trackColor = useThemeColor({}, 'progressTrack');
  const fillColor = useThemeColor({}, 'progressFill');
  const celebrationColor = useThemeColor({}, 'celebration');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const milestoneAchieved = useThemeColor({}, 'milestoneAchieved');
  const milestoneUpcoming = useThemeColor({}, 'milestoneUpcoming');

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
      <View style={styles.trackContainer}>
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
        {MILESTONES.map((milestone, index) => {
          const isAchieved = currentDays >= milestone;
          const position = MILESTONE_POSITIONS[index];
          return (
            <View
              key={milestone}
              style={[
                styles.milestone,
                {
                  left: `${position}%`,
                  backgroundColor: isAchieved
                    ? milestoneAchieved
                    : 'transparent',
                  borderColor: isAchieved ? milestoneAchieved : milestoneUpcoming,
                },
              ]}
            />
          );
        })}
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
    marginBottom: 12,
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
  trackContainer: {
    position: 'relative',
    height: 8,
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
  milestone: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginLeft: -6,
  },
  completeText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
