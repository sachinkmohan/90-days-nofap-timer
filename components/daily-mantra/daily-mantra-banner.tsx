import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getQuoteForDay } from '@/utils/quotes';

const HINT_SEEN_KEY = '@mantra_hint_seen';

interface DailyMantraBannerProps {
  streakDays: number;
}

export function DailyMantraBanner({ streakDays }: DailyMantraBannerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [hintSeen, setHintSeen] = useState(true); // optimistic: hide hint until loaded

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const borderColor = useThemeColor({}, 'border');

  const quote = getQuoteForDay(streakDays);

  useEffect(() => {
    AsyncStorage.getItem(HINT_SEEN_KEY).then((val) => {
      setHintSeen(val === 'true');
    });
  }, []);

  const handlePress = useCallback(async () => {
    setModalVisible(true);
    if (!hintSeen) {
      setHintSeen(true);
      await AsyncStorage.setItem(HINT_SEEN_KEY, 'true');
    }
  }, [hintSeen]);

  return (
    <>
      <TouchableOpacity
        style={[styles.banner, { backgroundColor: tintColor }]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerIcon}>✦</Text>
          <Text style={styles.bannerLabel}>DAILY MANTRA</Text>
        </View>
        <View style={styles.bannerCenter}>
          {hintSeen ? (
            <Text style={styles.bannerQuotePreview} numberOfLines={1}>
              {quote.text}
            </Text>
          ) : (
            <Text style={styles.bannerHint}>Tap to read today's mantra</Text>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <View style={[styles.cardHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.cardLabel, { color: tintColor }]}>✦ DAILY MANTRA</Text>
              <View style={[styles.dayBadge, { backgroundColor: tintColor }]}>
                <Text style={styles.dayBadgeText}>DAY {Math.max(1, streakDays)}</Text>
              </View>
            </View>
            <Text style={[styles.quoteText, { color: textColor }]}>{`"${quote.text}"`}</Text>
            <Text style={[styles.authorText, { color: tintColor }]}>— {quote.author}</Text>
            <Text style={[styles.categoryText, { color: secondaryColor }]}>{quote.category}</Text>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: secondaryColor }]}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 10,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  bannerIcon: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.6)',
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(0,0,0,0.7)',
  },
  bannerCenter: {
    flex: 1,
    overflow: 'hidden',
  },
  bannerQuotePreview: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.85)',
    fontStyle: 'italic',
  },
  bannerHint: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.7)',
    fontStyle: 'italic',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  dayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.8,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  authorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  closeButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
