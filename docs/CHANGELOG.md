# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — Feature 3: Daily Check-in + Journal (NFT-19)

### Added
- **Daily check-in modal** (`app/check-in-modal.tsx`) — Day label, rotating mantra quote via `getQuoteForDay`, daily reflection prompt rotating by day-of-year, 3-tap mood picker (😤 Struggling / 😐 Neutral / 💪 Strong), 280-char optional note field, Save/Skip actions
- `utils/check-in.ts` — `getCheckInPrompt(dayOfYear)` pure helper; cycles 5 reflection prompts using `dayOfYear % 5`
- `utils/history.ts` — `getHistoryDays(round, checkIns)` pure helper; merges `RelapseEvent[]` and `CheckInEntry[]` into unified `HistoryDay[]` sorted newest-first
- `cleanDay` color token in `constants/theme.ts` — `#16A34A` (light) / `#4ADE80` (dark)
- **Round-complete screen** on home tab (`app/(tabs)/index.tsx`) — when a round ends and the user dismisses the round-summary with "Maybe later", the timer UI is replaced with a minimal "Round complete!" screen showing "Start Round N+1" and "Not yet" (navigates back to round-summary); user is never left with a frozen day-90 timer and no clear next step

### Changed
- **History tab** (`app/(tabs)/history.tsx`) — rewritten to show merged relapse + check-in entries per day; clean days show green dot + mood emoji + note preview (tap to expand full note); relapse days show red dot + count; days with check-in on a relapse day show mood below relapse info; days with no check-in show no journal indicator
- `check-in-modal.tsx` — `todayDate` now uses `format(today, 'yyyy-MM-dd')` (date-fns) instead of `toISOString().split('T')[0]` to avoid UTC date shift for users in negative-offset timezones
- `use-multi-tap.ts` — dev-menu trigger now fires a haptic success notification (`Haptics.notificationAsync`) on the 5th tap; Promise marked `void` to satisfy strict linting

### Fixed
- `check-in-modal.tsx` — `handleSave` now catches errors from `saveCheckIn` and shows an inline error message instead of producing an unhandled rejection
- `history.tsx` — clean-day dot replaced hardcoded `#4ADE80` hex with `cleanDay` theme token via `useThemeColor`
- `app/(tabs)/index.tsx` and `app/round-summary.tsx` — `handleStartNextRound` now has a `catch` block so errors from `finishRound`/`startNewRound` are logged and the double-tap guard is always reset via `finally`

### Tests
- 114 tests across 12 suites (up from 105)
- New suites: `check-in.test.ts` (3 tests — prompt rotation, wrap-around), `history.test.ts` (6 tests — empty states, relapse day, check-in day, same-day merge, newest-first sort)

---

## [Unreleased] — Feature 2: Notifications (NFT-18)

### Added
- `NotificationService` (`services/notification-service.ts`) — schedules repeating daily local notifications at chosen preset time and fires milestone notifications at 7, 14, 30, and 60 clean days
- Onboarding notification step — requests permission before finishing onboarding, shows 3 preset options (🌅 Morning 8 AM / ☀️ Afternoon 2 PM / 🌙 Evening 8 PM), saves selection; silently skips if permission denied
- `StorageService` notification methods: `saveNotificationPreset()`, `getNotificationPreset()`, `saveNotifiedMilestone()`, `getNotifiedMilestones()`
- `utils/notifications.ts` — `getNotificationBody()`, `getPresetHour()`, `MILESTONES` constant (`[7, 14, 30, 60]`)
- `expo-notifications` plugin and `NSUserNotificationsUsageDescription` added to `app.json`
- `expo-dev-client` added to dependencies
- Milestone check on app open — iterates all thresholds so milestones crossed while the app was closed are not missed; deduplicates per round + last-relapse anchor to prevent re-firing
- Docs: `docs/testing/notifications-testing-guide.md` — notification setup and physical-device testing guide

### Changed
- `TimerProvider` — checks for overdue milestone notifications and reschedules daily reminders on app open; reschedules on `startNewRound()` so day count resets correctly
- `StorageService` — simplified; legacy fields removed
- Removed dead code: `app/reset-modal.tsx`, `components/history/history-item.tsx`, `components/timer/reset-button.tsx`
- `app/_layout.tsx` — registered `check-in-modal` as a modal screen

### Fixed
- Milestone notifications deduplicated — same milestone cannot fire twice for the same clean streak anchor
- `CalendarGrid` and calendar test suite — minor correctness fixes

### Tests
- Added `__tests__/utils/notifications.test.ts` — 75 tests covering notification body copy, preset hours, and milestone thresholds

---

## [Unreleased] — Post-Feature-1 Code Review Fixes

### Added
- `StorageService.createRoundWithDate(startDate)` — extracted from `completeOnboarding` so onboarding can anchor a round to a user-chosen date without bypassing `StorageService`
- `badgeText` theme token in `constants/theme.ts` — replaces hardcoded `#fff` on badge text in Insights and clean-day cells in CalendarGrid
- `isSubmitting` guard in `app/relapse-modal.tsx` — disables the "Log relapse" button during the async call to prevent double-logging on rapid taps
- `isStartingRound` ref guard in `app/round-summary.tsx` — prevents `finishRound` + `startNewRound` from being called twice on rapid taps
- `accessibilityRole="button"` and `accessibilityLabel` on the "Log a relapse →" Pressable in `RelapseCard`

### Changed
- `completeOnboarding` in `timer-context.tsx` now uses `StorageService.createRoundWithDate` instead of a raw `AsyncStorage.setItem('@rounds', ...)` call
- `devSeedRelapses` — `relapseCountThatDay` corrected from loop index (`i+1`) to `1` for each seeded event; each seeded day has exactly one relapse
- `getDayInRound` — clamped to a minimum of 1 so a future `startDate` never returns 0 or a negative value
- `CalendarGrid` — precomputes a `dateStr → count` map from `relapses` before the render loop instead of calling `getRelapsesForDay` per cell (O(relapses) vs O(days × relapses))
- `use-multi-tap` — moved `Haptics.notificationAsync` and `setTimeout(callback)` out of the `setTapTimes` state updater so side effects don't fire twice in React Strict Mode
- `app/(tabs)/index.tsx` — consolidated two separate `useEffect` hooks (redirect + flag reset) into one using a ref to track the previous round ID
- `router.dismiss()` + `router.push('/round-summary')` in dev menu replaced with atomic `router.dismissTo('/round-summary')`
- `round-summary.tsx` — returns a redirect to `/(tabs)` via `useEffect` instead of bare `null` when `currentRound` is missing
- `saveRelapse` and `completeRound` in `StorageService` now emit `console.warn` when the roundId is not found instead of silently returning

### Fixed
- `devSeedRelapses` was marking seeded relapses with incrementing `relapseCountThatDay` (1, 2, 3) when each is the first relapse on its respective day

### Tests
- 93 tests across 9 suites (up from 89)
- `rounds.test.ts` — added case: `getDayInRound` returns 1 when `startDate` is in the future
- `storage-rounds.test.ts` — 3 new cases for `StorageService.createRoundWithDate`: correct `startDate`, persistence, and `roundNumber` increment

---

## [Unreleased] — Feature 1: Round Model + Home Screen Redesign

### Added
- **Round model** — replaced streak-based timer with a fixed 90-day round. Relapses are logged events within the round; the clock never stops
- `Round`, `RelapseEvent`, `CheckInEntry` types in `types/timer.ts`; old `TimerState` and `ResetEntry` removed
- `StorageService` round methods: `getRounds()`, `startNewRound()`, `saveRelapse()`, `completeRound()`, `getCheckIns()`, `saveCheckIn()`
- `utils/rounds.ts` — pure helpers: `getDayInRound()`, `getDaysSinceLastRelapse()`, `getRelapseCountToday()`
- `utils/relapse-card.ts` — pure helpers: `getRelapseCardDisplayMode()` (none/precise/days), `getRelapsesForDay()`, `getRelapseMessage()`
- `utils/round-summary.ts` — pure helpers: `getLongestCleanStreak()`, `getRoundComparison()`, `getRoundDuration()`
- **Home screen redesign** (`app/(tabs)/index.tsx`): hero "Day X of 90", updated `ProgressBar`, new `RelapseCard` and `CheckInCard` components, calendar wired to round relapses
- `components/timer/relapse-card.tsx` — shows precise time (<24h) or day count (≥24h), "Log a relapse →" action
- `components/timer/checkin-card.tsx` — pending or completed state, taps open check-in modal
- **Relapse modal** (`app/relapse-modal.tsx`): context-aware chaser effect messages (0 relapses → encouragement, 1 relapse → chaser warning, 2+ → button only, no message)
- **Round summary screen** (`app/round-summary.tsx`): total relapses, longest clean streak, round comparison (Round 2+), "Start Round X+1" and "Maybe later" buttons
- **Insights tab** (`app/(tabs)/insights.tsx`): all rounds as cards with stats — relapses, longest streak, duration. Active round highlighted
- **History tab** rewritten to show `RelapseEvent[]` from current round (temporary; full journal integration in Feature 3)
- `allRounds` exposed from `TimerContext`; `currentRound` derived from `allRounds` (single source of truth, eliminates sync bugs)
- Dev menu enhancements: "Seed 3 relapses" button, "View Round Summary" button, current day counter display
- `date-fns` installed and used for all time/date calculations

### Changed
- `ProgressBar` props simplified to `dayInRound` only — computes progress internally
- `CalendarGrid` updated to accept `RelapseEvent[]`; relapse days display `×N` instead of day number
- `timer-context.tsx` fully rewritten around `allRounds` state; dev mode preserved

### Fixed
- Multi-tap dev menu crash — `router.push` inside `setTapTimes` state updater deferred via `setTimeout`
- Duplicate FlatList keys in history screen when seeding relapses multiple times
- Round summary redirect loop — uses `router.push` + `redirectedToSummary` flag to prevent re-navigation after "Maybe later"
- `allRounds` sync bug — `logRelapse`, `finishRound`, and `devSeedRelapses` now update both `currentRound` and the corresponding entry in `allRounds`, so Insights tab and round comparison always reflect live data

### Tests
- 89 tests across 9 suites (up from 63)
- New suites: `storage-rounds`, `rounds`, `relapse-card`, `relapse-calendar`, `round-summary`

---

## [Pre-release] — NFT-13

### Added
- `shouldSkipOnboarding(startDate, hasCompletedOnboarding)` pure async helper in `utils/onboarding.ts` — returns `true` if onboarding should be skipped based on in-memory state or the persisted flag, short-circuiting the storage call when `startDate` is already set
- `MAX_DAYS_AGO` constant exported from `utils/onboarding.ts` so consumers can reference the 90-day limit without duplicating the magic number
- Guard at the top of `completeOnboarding` in `TimerProvider` — no-ops (returns early) if onboarding is already complete or a live `startDate` exists, preventing double-execution on back-navigation or repeated calls from clearing history and calendar events
- Onboarding screen now defers `selectedDate` initialisation until the timer context finishes loading (`isLoading` flag), showing an `ActivityIndicator` spinner while hydrating and syncing the date picker to `storedStartDate` via `useEffect` once ready
- Home screen (`app/(tabs)/index.tsx`) returns `null` immediately after the loading guard when `startDate` is absent, eliminating the brief flash of the timer UI before the redirect to `/onboarding` fires

### Fixed
- `app/(tabs)/index.tsx`: timer UI no longer flashes for users who have not completed onboarding — the component renders nothing while the `useEffect` redirect is pending
- `app/onboarding.tsx`: date picker no longer shows today's date for returning users whose `storedStartDate` arrives asynchronously; `selectedDate` is now synced after hydration
- `contexts/timer-context.tsx`: `completeOnboarding` no longer wipes history and calendar events if called more than once (e.g. via back-navigation race condition)
- `__tests__/services/storage-calendar.test.ts`: removed `@ts-ignore` suppression and replaced the incomplete `ResetEntry` test fixture with a fully typed object including `resetDate` and `trigger` fields

### Tests
- Added four unit tests for `shouldSkipOnboarding` covering: first-time path (both checks false), in-memory guard (startDate set), persistent flag guard, and short-circuit behaviour (storage not called when startDate is set)
- Fixed `storage-calendar.test.ts` 'clears history correctly' spec to pass a valid `ResetEntry` without bypassing TypeScript

---

## [NFT-12] — Calendar event handling

### Added
- Calendar event management and storage (`StorageService.addCalendarEvent`, `clearCalendarEvents`, `getCalendarEvents`)
- Concurrent `addCalendarEvent` deduplication
- Improved test coverage for calendar storage

---

## [Earlier]

- Icon and splash screen assets updated
- Android package name updated to match branding
