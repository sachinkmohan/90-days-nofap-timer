# Calendar Feature

A 90-day progress calendar on the home screen, built using TDD (red→green loop).

---

## What it shows

- **Stats row** — "X days sober" (current streak) and "Total clean days" (cumulative across all streaks), displayed above the calendar
- **Calendar grid** — 90 days shown 30 at a time, swipeable across 3 pages
- **Page indicator dots** — sync with the current swipe position

### Day states

| State | Visual |
|-------|--------|
| Past day, no relapse | Green filled cell |
| Today | Outlined cell (tint color) |
| Day you reset | Neutral cell with a small red dot at the bottom |
| Future day | Faded neutral cell |

---

## Key design decisions

### Calendar anchor date (`calendarStartDate`)
The calendar anchors to the **first day you ever started**, not the current streak's start date. This is stored separately in AsyncStorage and **never changes when you reset**. This means:
- Your green days from before a relapse stay green
- Only the specific day you reset gets a red dot
- The 90-day journey is continuous

### Streak counter vs calendar
These are two separate concepts:
- **`startDate`** — resets when you relapse; drives the "X days sober" counter and the timer
- **`calendarStartDate`** — never resets; drives the calendar grid

### Red dot, not red cell
A full red background felt punishing. A small red dot at the bottom of the day cell marks the relapse without dominating the view.

### Relapse check before today check
`getDayStatus` checks for a relapse event **before** checking if the day is today. This ensures the day you reset shows a red dot immediately, not just a highlight.

### Local date format
Dates are stored and compared using **local date strings** (`YYYY-MM-DD` based on the device's timezone), not UTC. Using `.toISOString()` would produce the wrong date in timezones ahead of UTC (e.g. IST, JST).

---

## Files added / changed

### New files

| File | What it does |
|------|-------------|
| `utils/calendar.ts` | Pure functions for all calendar logic (exported, testable) |
| `components/calendar/calendar-grid.tsx` | Swipeable 30-day grid component |
| `components/calendar/streak-stats.tsx` | "Days sober" + "Total clean days" display |
| `__tests__/utils/calendar.test.ts` | 11 tests for the calendar utility functions |
| `__tests__/services/storage-calendar.test.ts` | 4 tests for calendar storage methods |
| `jest.config.js` | Jest setup with `jest-expo` preset and `@/` path alias |

### Modified files

| File | What changed |
|------|-------------|
| `types/timer.ts` | Added `CalendarEvent` type |
| `services/storage.ts` | Added `getCalendarEvents`, `addCalendarEvent`, `getCalendarStartDate`, `setCalendarStartDate` |
| `contexts/timer-context.tsx` | Loads calendar data on boot; records relapse event on reset; computes `totalCleanDays`; exposes `calendarStartDate` |
| `app/(tabs)/index.tsx` | Home screen now shows `StreakStats` + `CalendarGrid` above the timer, wrapped in a `ScrollView` |
| `package.json` | Added `jest`, `jest-expo`, `@types/jest`; added `"test"` script |

---

## Core logic (`utils/calendar.ts`)

### `getDayStatus(startDate, dayIndex, events)`
Determines the display state of a single calendar day.

```
dayIndex 0 = calendarStartDate
dayIndex 1 = calendarStartDate + 1 day
...
dayIndex 89 = calendarStartDate + 89 days
```

Decision order (important — relapse is checked before today):
1. Date is after today → `future`
2. Date has a relapse event → `relapsed`
3. Date is today → `today`
4. Otherwise → `clean`

### `getCalendarPage(startDate)`
Returns which 30-day page (0, 1, or 2) contains today, so the calendar auto-scrolls there on open.

### `computeTotalCleanDays(history, currentDays)`
```
total = sum of streakDays from all past resets + current streak days
```
This accumulates across all attempts — a relapse doesn't wipe your total.

### `toLocalDateStr(date)`
Converts a `Date` to `YYYY-MM-DD` using **local timezone**, not UTC.

---

## Tests (15 total, all passing)

```
getDayStatus
  ✓ returns future for a day index whose date is after today
  ✓ returns today for a day index whose date matches today
  ✓ returns clean for a past day with no relapse event
  ✓ returns relapsed (not today) when there is a relapse event for today
  ✓ returns relapsed for a past day that has a matching calendar event

getCalendarPage
  ✓ returns 0 when fewer than 30 days have elapsed since startDate
  ✓ returns 1 when between 30 and 59 days have elapsed
  ✓ returns 2 when 60 or more days have elapsed
  ✓ clamps to 2 even when more than 90 days have elapsed

computeTotalCleanDays
  ✓ returns just the current days when there is no history
  ✓ adds history streak days to the current streak

StorageService calendar start date
  ✓ returns null when no calendar start date has been set
  ✓ stores and retrieves the calendar start date

StorageService.addCalendarEvent
  ✓ stores a relapse event and retrieves it
  ✓ does not add a duplicate event for the same date
```

---

## Running tests

```bash
npm test
```
