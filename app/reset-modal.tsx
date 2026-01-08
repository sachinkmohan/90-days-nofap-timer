import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';

const TRIGGER_SUGGESTIONS = ['Stress', 'Boredom', 'Loneliness', 'Late night'];

export default function ResetModal() {
  const router = useRouter();
  const { resetTimer, countdown } = useTimer();
  const [trigger, setTrigger] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const borderColor = useThemeColor({}, 'border');
  const resetButtonColor = useThemeColor({}, 'resetButtonPressed');

  const handleReset = async () => {
    await resetTimer(trigger);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSuggestionPress = (suggestion: string) => {
    setTrigger(suggestion);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <ThemedText style={styles.title}>Reset Timer?</ThemedText>

          <ThemedText style={[styles.streakInfo, { color: secondaryColor }]}>
            Current streak: {countdown.days} days
          </ThemedText>

          <ThemedText style={[styles.label, { color: secondaryColor }]}>
            What triggered this? (optional, private)
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor,
                borderColor,
                color: textColor,
              },
            ]}
            placeholder="Brief note..."
            placeholderTextColor={secondaryColor}
            value={trigger}
            onChangeText={setTrigger}
            maxLength={50}
            returnKeyType="done"
          />

          <View style={styles.suggestions}>
            {TRIGGER_SUGGESTIONS.map((suggestion) => (
              <Pressable
                key={suggestion}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor,
                    borderColor,
                  },
                  trigger === suggestion && {
                    borderColor: textColor,
                  },
                ]}
                onPress={() => handleSuggestionPress(suggestion)}>
                <ThemedText style={styles.suggestionText}>
                  {suggestion}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.cancelButton, { borderColor }]}
              onPress={handleCancel}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.resetButton,
                { backgroundColor: resetButtonColor },
              ]}
              onPress={handleReset}>
              <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  streakInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {},
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});
