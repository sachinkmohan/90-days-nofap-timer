# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
