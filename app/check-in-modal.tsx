import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCheckInPrompt } from '@/utils/check-in';
import { getQuoteForDay } from '@/utils/quotes';
import type { CheckInEntry } from '@/types/timer';
import { getDayOfYear } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOODS: { key: CheckInEntry['mood']; emoji: string; label: string }[] = [
  { key: 'struggling', emoji: '😤', label: 'Struggling' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'strong', emoji: '💪', label: 'Strong' },
];

export default function CheckInModal() {
  const router = useRouter();
  const { dayInRound, saveCheckIn } = useTimer();

  const [mood, setMood] = useState<CheckInEntry['mood'] | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const border = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const prompt = getCheckInPrompt(dayOfYear);
  const quote = getQuoteForDay(dayInRound);
  const todayDate = today.toISOString().split('T')[0];

  const handleSave = async () => {
    if (!mood || isSaving) return;
    setIsSaving(true);
    try {
      const entry: CheckInEntry = {
        date: todayDate,
        mood,
        ...(note.trim() ? { note: note.trim() } : {}),
      };
      await saveCheckIn(entry);
      router.dismiss();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText style={[styles.dayLabel, { color: tint }]}>Day {dayInRound}</ThemedText>
            <ThemedText style={styles.title}>Daily Check-in</ThemedText>
          </View>

          {/* Mantra banner */}
          <View style={[styles.quoteCard, { backgroundColor: cardBackground, borderColor: border }]}>
            <ThemedText style={[styles.quoteText, { color: secondaryColor }]}>
              "{quote.text}"
            </ThemedText>
            <ThemedText style={[styles.quoteAuthor, { color: secondaryColor }]}>
              — {quote.author}
            </ThemedText>
          </View>

          {/* Daily prompt */}
          <ThemedText style={[styles.prompt, { color: textColor }]}>{prompt}</ThemedText>

          {/* Mood selection */}
          <View style={styles.moodRow}>
            {MOODS.map((m) => {
              const selected = mood === m.key;
              return (
                <Pressable
                  key={m.key}
                  style={[
                    styles.moodButton,
                    { borderColor: selected ? tint : border, backgroundColor: cardBackground },
                    selected && { borderWidth: 2 },
                  ]}
                  onPress={() => setMood(m.key)}
                >
                  <ThemedText style={styles.moodEmoji}>{m.emoji}</ThemedText>
                  <ThemedText style={[styles.moodLabel, { color: selected ? tint : secondaryColor }]}>
                    {m.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Optional note */}
          <TextInput
            style={[
              styles.noteInput,
              { backgroundColor: cardBackground, borderColor: border, color: textColor },
            ]}
            placeholder="Anything to add?"
            placeholderTextColor={secondaryColor}
            value={note}
            onChangeText={(t) => setNote(t.slice(0, 280))}
            multiline
            maxLength={280}
          />
          {note.length > 0 && (
            <ThemedText style={[styles.charCount, { color: secondaryColor }]}>
              {note.length}/280
            </ThemedText>
          )}

          {/* Actions */}
          <Pressable
            style={[
              styles.saveButton,
              { backgroundColor: tint, opacity: !mood || isSaving ? 0.4 : 1 },
            ]}
            onPress={handleSave}
            disabled={!mood || isSaving}
          >
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </Pressable>

          <Pressable onPress={() => router.dismiss()} style={styles.skipRow}>
            <ThemedText style={[styles.skipText, { color: secondaryColor }]}>Skip</ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  quoteCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 12,
    textAlign: 'right',
  },
  prompt: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: -14,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
  },
});
