import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { RelapseEvent } from '@/types/timer';
import { getCalendarPage } from '@/utils/calendar';
import { getRelapsesForDay } from '@/utils/relapse-card';
import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

const DAYS_PER_PAGE = 30;
const COLS = 10;

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface CalendarGridProps {
  startDate: Date;
  relapses: RelapseEvent[];
}

export function CalendarGrid({ startDate, relapses }: CalendarGridProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const tintColor = useThemeColor({}, 'tint');
  const secondaryColor = useThemeColor({}, 'timerSecondary');
  const trackColor = useThemeColor({}, 'progressTrack');
  const cleanColor = useThemeColor({}, 'progressFill');
  const relapsedColor = useThemeColor({}, 'resetButtonPressed');

  const initialPage = getCalendarPage(startDate);
  const [activePage, setActivePage] = useState(initialPage);

  const todayStr = toLocalDateStr(new Date());

  const PADDING = 16;
  const GAP = 4;
  const cellOuter = Math.floor((width - PADDING * 2) / COLS);
  const cellInner = cellOuter - GAP;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onLayout={() => {
          scrollRef.current?.scrollTo({
            x: initialPage * width,
            animated: false,
          });
        }}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / width);
          setActivePage(page);
        }}
        style={{ width }}
      >
        {([0, 1, 2] as const).map((pageIndex) => {
          const startDayIndex = pageIndex * DAYS_PER_PAGE;
          return (
            <View key={pageIndex} style={{ width, paddingHorizontal: PADDING }}>
              <ThemedText style={[styles.pageLabel, { color: secondaryColor }]}>
                Days {startDayIndex + 1}–{startDayIndex + DAYS_PER_PAGE}
              </ThemedText>
              <View style={styles.grid}>
                {Array.from({ length: DAYS_PER_PAGE }, (_, i) => {
                  const dayIndex = startDayIndex + i;
                  const cellDate = new Date(startDate);
                  cellDate.setDate(cellDate.getDate() + dayIndex);
                  const dayStr = toLocalDateStr(cellDate);
                  const dayNumber = dayIndex + 1;

                  const isFuture = dayStr > todayStr;
                  const isToday = dayStr === todayStr;
                  const relapseCount = isFuture ? 0 : getRelapsesForDay(relapses, dayStr);
                  const isRelapsed = relapseCount > 0;

                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.cellWrapper,
                        { width: cellOuter, height: cellOuter },
                      ]}
                    >
                      <View
                        style={[
                          styles.cell,
                          { width: cellInner, height: cellInner },
                          !isFuture && !isRelapsed && !isToday && { backgroundColor: cleanColor },
                          isToday && { borderWidth: 2, borderColor: tintColor },
                          (isFuture || isRelapsed) && { backgroundColor: trackColor },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.dayNumber,
                            !isFuture && !isRelapsed && !isToday && { color: '#fff' },
                            isToday && { color: tintColor, fontWeight: '600' },
                            isFuture && { color: secondaryColor, opacity: 0.35 },
                            isRelapsed && { color: relapsedColor, fontWeight: '600' },
                          ]}
                        >
                          {isRelapsed ? `×${relapseCount}` : dayNumber}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.indicators}>
        {([0, 1, 2] as const).map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activePage ? tintColor : trackColor,
                width: i === activePage ? 16 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  pageLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 9,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
