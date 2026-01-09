import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface DevModeBannerProps {
  devStartDate: Date | null;
}

export function DevModeBanner({ devStartDate }: DevModeBannerProps) {
  const bannerColor = useThemeColor({}, 'devModeBanner');
  const textColor = useThemeColor({}, 'devModeText');

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysElapsed = (date: Date | null) => {
    if (!date) return 0;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const days = getDaysElapsed(devStartDate);

  return (
    <View style={[styles.banner, { backgroundColor: bannerColor }]}>
      <ThemedText style={[styles.bannerText, { color: textColor }]}>
        🛠️ DEV MODE - Testing {days} day{days !== 1 ? 's' : ''} ({formatDate(devStartDate)})
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
