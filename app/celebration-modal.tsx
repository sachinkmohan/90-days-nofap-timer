import { useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function CelebrationModal() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const celebrationColor = useThemeColor({}, 'celebration');
  const tintColor = useThemeColor({}, 'tint');

  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Trigger success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate in
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    rotation.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withRepeat(
        withSequence(
          withTiming(10, { duration: 200 }),
          withTiming(-10, { duration: 200 })
        ),
        3,
        true
      ),
      withTiming(0, { duration: 100 })
    );
  }, [scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handleContinue = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.emojiContainer, animatedStyle]}>
          <ThemedText style={styles.emoji}>🎉</ThemedText>
        </Animated.View>

        <ThemedText style={[styles.title, { color: celebrationColor }]}>
          90 Days Achieved!
        </ThemedText>

        <ThemedText style={styles.message}>
          {"You've built incredible discipline and self-control. This is a major milestone. Be proud of yourself."}
        </ThemedText>

        <ThemedText style={styles.subMessage}>
          Your timer will continue counting. Keep going!
        </ThemedText>

        <Pressable
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={handleContinue}>
          <ThemedText style={styles.buttonText}>Continue Journey</ThemedText>
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
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emojiContainer: {
    marginBottom: 24,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
