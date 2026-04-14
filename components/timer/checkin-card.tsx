import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { CheckInEntry } from '@/types/timer';
import { Pressable, StyleSheet, View } from 'react-native';

const MOOD_EMOJI: Record<CheckInEntry['mood'], string> = {
  struggling: '😤',
  neutral: '😐',
  strong: '💪',
};

interface CheckInCardProps {
  todayCheckIn: CheckInEntry | null;
  onCheckIn: () => void;
}

export function CheckInCard({ todayCheckIn, onCheckIn }: CheckInCardProps) {
  const cardBg = useThemeColor({}, 'cardBackground');
  const border = useThemeColor({}, 'border');
  const secondary = useThemeColor({}, 'timerSecondary');
  const tint = useThemeColor({}, 'tint');

  if (todayCheckIn) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        <ThemedText style={[styles.status, { color: secondary }]}>
          {MOOD_EMOJI[todayCheckIn.mood]} Checked in
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <ThemedText style={[styles.status, { color: secondary }]}>How are you today?</ThemedText>
      <Pressable onPress={onCheckIn} style={styles.action}>
        <ThemedText style={[styles.actionText, { color: tint }]}>Check in for today →</ThemedText>
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
