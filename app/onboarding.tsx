import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isPastDate, isValidStartDate } from '@/utils/onboarding';

type Step = 'welcome' | 'date';

// Merge a time-of-day from one Date into the calendar date of another
function mergeDateAndTime(date: Date, time: Date): Date {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
  return result;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, storedStartDate, isLoading } = useTimer();
  const [step, setStep] = useState<Step>('welcome');

  const now = new Date();
  const minDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // null until the timer context finishes loading so we don't flash a stale date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Sync selectedDate once hydration is complete
  useEffect(() => {
    if (isLoading) return;
    setSelectedDate(
      storedStartDate && isValidStartDate(storedStartDate) ? storedStartDate : new Date()
    );
  }, [isLoading, storedStartDate]);

  // Android: show each picker as a modal one at a time
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');

  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const showWarning = selectedDate !== null && isPastDate(selectedDate);
  const canConfirm = !isLoading && selectedDate !== null && isValidStartDate(selectedDate);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await completeOnboarding(selectedDate!);
    router.replace('/(tabs)');
  };

  const onDateChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) setSelectedDate((prev) => mergeDateAndTime(date, prev ?? new Date()));
  };

  const onTimeChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (date) setSelectedDate((prev) => mergeDateAndTime(prev ?? new Date(), date));
  };

  if (step === 'date' && selectedDate === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (step === 'welcome') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.welcomeContent}>
          <ThemedText style={styles.title}>90 Days</ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
            Track your journey to freedom.{'\n'}One day at a time.
          </ThemedText>
        </View>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: tintColor }]}
          onPress={() => setStep('date')}
        >
          <ThemedText style={styles.primaryButtonText}>Get Started</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  // selectedDate is guaranteed non-null here: the loader guard above returned early
  // when step === 'date' && selectedDate === null, and welcome returned above.
  const syncedDate = selectedDate!;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText style={styles.title}>When did you start?</ThemedText>
        <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
          Set the date and time of your last relapse.
        </ThemedText>

        {/* Date picker */}
        <View style={[styles.pickerCard, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.pickerLabel, { color: secondaryColor }]}>
            Date
          </ThemedText>
          {Platform.OS === 'android' && (
            <Pressable onPress={() => setShowDatePicker(true)}>
              <ThemedText style={[styles.androidPickerValue, { color: tintColor }]}>
                {syncedDate.toLocaleDateString(undefined, {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                })}
              </ThemedText>
            </Pressable>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={syncedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={now}
              minimumDate={minDate}
              style={styles.picker}
            />
          )}
        </View>

        {/* Time picker */}
        <View style={[styles.pickerCard, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.pickerLabel, { color: secondaryColor }]}>
            Time
          </ThemedText>
          {Platform.OS === 'android' && (
            <Pressable onPress={() => setShowTimePicker(true)}>
              <ThemedText style={[styles.androidPickerValue, { color: tintColor }]}>
                {syncedDate.toLocaleTimeString(undefined, {
                  hour: '2-digit', minute: '2-digit',
                })}
              </ThemedText>
            </Pressable>
          )}
          {showTimePicker && (
            <DateTimePicker
              value={syncedDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              style={styles.picker}
            />
          )}
        </View>

        <ThemedText style={[styles.selectedSummary, { color: secondaryColor }]}>
          {formatDateTime(syncedDate)}
        </ThemedText>

        {showWarning && (
          <View style={[styles.warningBox, { borderColor, backgroundColor: cardBackground }]}>
            <ThemedText style={[styles.warningText, { color: secondaryColor }]}>
              Starting from a past date will mark all days until today as clean automatically.
              For more accurate day-by-day tracking, consider starting fresh from today.
            </ThemedText>
          </View>
        )}

        <ThemedText style={[styles.lockNote, { color: secondaryColor }]}>
          This date cannot be changed until you complete 90 days.
        </ThemedText>
      </ScrollView>

      <Pressable
        style={[
          styles.primaryButton,
          { backgroundColor: tintColor },
          !canConfirm && styles.disabledButton,
        ]}
        onPress={handleConfirm}
        disabled={!canConfirm}
      >
        <ThemedText style={styles.primaryButtonText}>Start my journey</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    gap: 16,
    paddingBottom: 16,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 46,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  pickerCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  picker: {
    width: '100%',
  },
  androidPickerValue: {
    fontSize: 17,
    fontWeight: '400',
    paddingVertical: 10,
  },
  selectedSummary: {
    fontSize: 13,
    textAlign: 'center',
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
  },
  lockNote: {
    fontSize: 12,
    textAlign: 'center',
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.4,
  },
  loader: {
    flex: 1,
  },
});
