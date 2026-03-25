# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — NFT-13

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
