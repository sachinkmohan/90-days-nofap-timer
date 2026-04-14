import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getRelapseMessage } from '@/utils/relapse-card';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RelapseModal() {
  const router = useRouter();
  const { relapseCountToday, logRelapse } = useTimer();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const tint = useThemeColor({}, 'tint');

  const message = getRelapseMessage(relapseCountToday);

  const handleLogRelapse = async () => {
    await logRelapse();
    router.dismiss();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        {message !== null && (
          <ThemedText style={styles.message}>{message}</ThemedText>
        )}
        <Pressable
          style={[styles.button, { backgroundColor: tint }]}
          onPress={handleLogRelapse}
        >
          <ThemedText style={styles.buttonText}>Log relapse</ThemedText>
        </Pressable>
        <Pressable onPress={() => router.dismiss()} style={styles.cancelRow}>
          <ThemedText style={[styles.cancelText, { color: secondaryColor }]}>
            Cancel
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: 24,
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    gap: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelRow: {
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 14,
  },
});
