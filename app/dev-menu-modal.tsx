import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTimer } from '@/contexts/timer-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DevStorageService, DEV_PRESETS } from '@/services/dev-storage';

export default function DevMenuModal() {
  const router = useRouter();
  const {
    isDevMode,
    devStartDate,
    startDate,
    enterDevMode,
    exitDevMode,
    setDevStartDate,
  } = useTimer();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const milestoneColor = useThemeColor({}, 'milestoneAchieved');
  const devBannerColor = useThemeColor({}, 'devModeBanner');
  const resetButtonColor = useThemeColor({}, 'resetButtonPressed');

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePresetPress = async (days: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const devDate = new Date(DevStorageService.calculateStartDateForDays(days));

    if (isDevMode) {
      // Already in dev mode, just update the date
      await setDevStartDate(devDate);
    } else {
      // Enter dev mode with this date
      await enterDevMode(devDate);
    }
  };

  const handleExitDevMode = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await exitDevMode();
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>🛠️ Developer Mode</ThemedText>
            <ThemedText style={[styles.subtitle, { color: devBannerColor }]}>
              Test different time states
            </ThemedText>
          </View>

          <View style={styles.statusSection}>
            <ThemedText style={[styles.statusLabel, { color: secondaryColor }]}>
              Status: {isDevMode ? 'Active' : 'Inactive'}
            </ThemedText>
            <ThemedText style={[styles.statusText, { color: secondaryColor }]}>
              Real start: {formatDate(startDate)}
            </ThemedText>
            {isDevMode && (
              <ThemedText style={[styles.statusText, { color: devBannerColor }]}>
                Dev start: {formatDate(devStartDate)}
              </ThemedText>
            )}
          </View>

          <View style={styles.presetsSection}>
            <ThemedText style={[styles.sectionTitle, { color: secondaryColor }]}>
              Quick Presets
            </ThemedText>
            <View style={styles.presetGrid}>
              {DEV_PRESETS.map((preset) => (
                <Pressable
                  key={preset.days}
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor,
                      borderColor: preset.isMilestone ? milestoneColor : borderColor,
                      borderWidth: preset.isMilestone ? 2 : 1,
                    },
                  ]}
                  onPress={() => handlePresetPress(preset.days)}>
                  <ThemedText
                    style={[
                      styles.presetLabel,
                      preset.isMilestone && { color: milestoneColor, fontWeight: '600' },
                    ]}>
                    {preset.label}
                  </ThemedText>
                  {preset.isMilestone && (
                    <ThemedText style={[styles.milestoneIndicator, { color: milestoneColor }]}>
                      ★
                    </ThemedText>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.infoSection}>
            <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
              Tap the History tab icon 5 times rapidly to open this menu.
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: secondaryColor }]}>
              Dev mode persists across app restarts.
            </ThemedText>
          </View>

          <View style={styles.buttons}>
            {isDevMode ? (
              <>
                <Pressable
                  style={[
                    styles.button,
                    styles.exitButton,
                    { backgroundColor: resetButtonColor },
                  ]}
                  onPress={handleExitDevMode}>
                  <ThemedText style={styles.exitButtonText}>Exit Dev Mode</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.closeButton, { borderColor }]}
                  onPress={handleClose}>
                  <ThemedText style={styles.closeButtonText}>Close</ThemedText>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: tintColor },
                ]}
                onPress={handleClose}>
                <ThemedText style={styles.primaryButtonText}>Close</ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  card: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
  },
  presetsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  milestoneIndicator: {
    fontSize: 12,
    marginTop: 2,
  },
  infoSection: {
    marginBottom: 24,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
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
  closeButton: {
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  exitButton: {},
  exitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  primaryButton: {},
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});
