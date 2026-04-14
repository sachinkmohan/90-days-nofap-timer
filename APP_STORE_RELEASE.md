# App Store Release Plan

## Design Decisions (Locked)

- **90-day window** is a fixed timeline, not a streak goal. The clock never stops. Relapses are logged events within the round, not restarts.
- **Round model** — user completes a round at day 90, sees a summary, then decides to start the next round.
- **Reset = Log a relapse** — language and action reframed. Not a restart, just recording an event.
- **Chaser effect handling** — 1st relapse of day shows encouragement, 2nd shows chaser effect message, 3rd+ logs silently with no prompt.
- **Journal** entries are attached to days in the history tab, not a separate list.
- **Notifications** use 3 presets (Morning / Afternoon / Evening) chosen during onboarding.
- **Data wipe** — wipe everything on next app open. Fresh start. No migration screen needed (no real users yet).
- **Round summary** shows total relapses + longest streak within the round. From Round 2 onward, shows improvement vs previous round.
- **Settings screen** has two options only: change notification time + manually restart current round.
- **date-fns** — install and use for all time/date calculations throughout the app.

### Home Screen Layout (top to bottom)
1. **"Day 47 of 90"** — hero number, counts up, feels like progress not pressure
2. **Progress bar** — visual % through the 90 days (existing `ProgressBar` component, update data source)
3. **Relapse card** — shows relapse info + "Log a relapse →" action inside it
4. **Check-in card** — shows "Check in for today →" or completed state
5. **Calendar** — relapse days show red dot + count number (e.g. "3" for chaser effect days)

### Removed from Home Screen
- Mantra banner → moved inside check-in modal
- Stats row (current streak, total clean days, reset count) → removed entirely
- Standalone reset button → moved into relapse card as "Log a relapse →"

### Relapse Card Logic
- Under 24 hours since last relapse → show **only** "Last relapse 3 hours ago" (precise time)
- After 24 hours → show **only** "12 days since last relapse" (day count)
- Never show both at the same time

---

## Feature Order

Work through these in order. Each one builds on the previous.

---

## Feature 1 — Round Model + Home Screen Redesign

> Foundational. Everything else builds on this. The current model wipes all progress on reset which is discouraging and triggers the chaser effect. This fixes the core design flaw.

### Setup
- [x] Install `date-fns`: `npm install date-fns`
- [x] Replace all manual time calculations in `utils/calendar.ts`, `utils/onboarding.ts`, and `contexts/timer-context.tsx` with `date-fns` equivalents (`differenceInDays`, `isSameDay`, `formatDistanceToNow`, `addDays`, `isAfter`)

### Data Model
- [x] Replace current "start date" concept with a `Round` type in `types/timer.ts`:
  ```ts
  Round: { id, roundNumber, startDate, endDate | null, relapses: RelapseEvent[] }
  RelapseEvent: { timestamp: string, relapseCountThatDay: number }
  ```
- [x] Add `CheckInEntry` type to `types/timer.ts`:
  ```ts
  CheckInEntry: { date: string, mood: 'struggling' | 'neutral' | 'strong', note?: string }
  ```
- [x] Wipe existing AsyncStorage data on next app open (no migration needed)
- [x] Add to `StorageService`:
  - `getRounds()` / `saveRound(round)`
  - `saveRelapse(roundId, event)` 
  - `completeRound(roundId)` — sets `endDate`
  - `startNewRound()` — creates new round, appends to rounds array
  - `saveCheckIn(entry)` / `getCheckIns()`

### Timer Context
- [x] Update `timer-context.tsx` to expose:
  - `currentRound` — the active round object
  - `roundNumber` — which round this is (1, 2, 3...)
  - `dayInRound` — days elapsed since round start (1–90), via `differenceInDays`
  - `daysSinceLastRelapse` — days since last `RelapseEvent` timestamp
  - `lastRelapseTimestamp` — raw timestamp of most recent relapse
  - `relapseCountToday` — how many relapses logged today via `isSameDay`
  - `checkIns` — all check-in entries
  - `todayCheckIn` — today's check-in entry or null
- [x] Remove old `startDate` / `history` / `countdown-driven` logic
- [x] Add `logRelapse()` action — handles chaser effect logic internally
- [x] Add `completeRound()` and `startNewRound()` actions
- [x] Add `saveCheckIn(entry)` action

### Home Screen Redesign (`app/(tabs)/index.tsx`)
- [x] Remove `DailyMantraBanner`, `StreakStats`, standalone `ResetButton`
- [x] Hero number: "Day [X] of 90" using `dayInRound`
- [x] Update `ProgressBar` to use `dayInRound / 90` as progress value
- [x] **Relapse card** (new component `components/timer/relapse-card.tsx`):
  - Shows "Last relapse [X hours ago]" when under 24h using `formatDistanceToNow`
  - Shows "[X] days since last relapse" when over 24h using `daysSinceLastRelapse`
  - "Log a relapse →" tappable action inside the card
  - If no relapses yet in round: "No relapses this round 💪"
- [x] **Check-in card** (new component `components/timer/checkin-card.tsx`):
  - Shows "Check in for today →" if `todayCheckIn` is null
  - Shows mood emoji + "Checked in" if already done today
  - Tapping opens check-in modal
- [x] Update calendar to show red dot + relapse count number on relapse days

### Relapse Flow (`app/relapse-modal.tsx`)
- [x] Rename/repurpose to `app/relapse-modal.tsx`
- [x] On open, check `relapseCountToday`:
  - **0 relapses today** → show *"One setback doesn't define your journey. If you feel the urge to go again today, that's the chaser effect. It passes."*, log and close
  - **1 relapse today** → show *"What you're feeling right now is the chaser effect. It's strongest in the next few hours, then it passes. Just get through today."*, log and close
  - **2+ relapses today** → modal opens with no message, just "Log relapse" button
- [x] Remove all logic that restarts the 90-day clock

### Round End (`app/round-summary.tsx`)
- [x] Detect when `dayInRound` reaches 90 in `timer-context.tsx`
- [x] Navigate to round summary screen automatically
- [x] Round summary shows:
  - "You completed Round [X]"
  - Total relapses in the round
  - Longest clean streak within the round
  - If Round 2+: *"Round 1: 8 relapses → Round 2: 5 relapses"*
- [x] "Start Round [X+1]" button → calls `startNewRound()`, navigates to home
- [x] "Maybe later" button → dismisses summary without starting new round

---

## Unplanned — Built Early

These were originally out of scope but built during Feature 1 development.

### Insights Tab (`app/(tabs)/insights.tsx`)
- [x] New tab showing all rounds (active + completed) as cards
- [x] Per card: round number, date range, total relapses, longest clean streak, days
- [x] Active round highlighted with teal border + "Active" badge
- [x] Completed rounds show gold "Complete" badge
- [x] Newest round shown first
- [x] Empty state until first round exists

### History Tab Rewrite (`app/(tabs)/history.tsx`)
- [x] Replaced old `ResetEntry[]` model with `RelapseEvent[]` from current round
- [x] Shows relapse events newest-first with date + relative time
- [x] Note: full check-in + journal integration still planned in Feature 3

### Dev Mode Improvements
- [x] Fixed `startDate` reference (old API) → now shows `currentRound.startDate` + current day
- [x] Added "Seed 3 relapses" button — injects test relapses on days 5, 12, 35 of current round
- [x] Added "View Round Summary" button — navigates directly to summary screen
- [x] Fixed multi-tap navigation crash (`router.push` inside state updater → deferred via `setTimeout`)

### Calendar UX Change
- [x] Relapse days show `×N` instead of day number (option C) — no overlap, no extra space needed

### Context Refactor
- [x] `currentRound` derived from `allRounds` (single source of truth, no sync bugs)
- [x] `allRounds` exposed in context for Insights tab and round comparison

---

## Feature 2 — Notifications

> Requires Feature 1 done first so `dayInRound` is accurate in notification text.

### Setup
- [ ] Install `expo-notifications`
- [ ] Add `expo-notifications` to `app.json` plugins
- [ ] Add `NSUserNotificationsUsageDescription` to `app.json` ios infoPlist

### Onboarding (`app/onboarding.tsx`)
- [ ] Add notification step as the last screen before finishing onboarding
- [ ] Show reason before permission prompt: *"Get a daily reminder to check in and stay on track"*
- [ ] Request permission via `expo-notifications`
- [ ] If granted, show 3 preset options:
  - 🌅 Morning (8:00 AM)
  - ☀️ Afternoon (2:00 PM)
  - 🌙 Evening (8:00 PM)
- [ ] Save chosen preset to `StorageService`
- [ ] If denied, skip silently — don't block onboarding completion

### Daily Reminder
- [ ] Schedule a repeating daily local notification at the chosen preset time
- [ ] Notification text: *"Day [X] — tap to check in"* using `dayInRound`
- [ ] Tapping notification navigates to home screen (check-in card is there)
- [ ] Reschedule on `startNewRound()` so day count resets correctly

### Milestone Notifications
- [ ] Trigger a local notification when `daysSinceLastRelapse` hits 7, 14, 30, 60 days
- [ ] Example: *"14 days since your last relapse. Keep going."*

---

## Feature 3 — Daily Check-in + Journal

> Requires Feature 1 (check-in card on home screen is already scaffolded there).

### Check-in Modal (`app/check-in-modal.tsx`)
- [ ] Show "Day [X]" at top using `dayInRound`
- [ ] Show daily mantra/prompt — rotate through list using day of year as index:
  - *"What's one thing that felt hard today?"*
  - *"What are you proud of this week?"*
  - *"What triggered you recently and how did you handle it?"*
  - *"What would you tell yourself on day 1?"*
  - *"What helped you get through today?"*
- [ ] Show mantra banner here (removed from home screen)
- [ ] Mood selection — required, one tap: 😤 Struggling / 😐 Neutral / 💪 Strong
- [ ] Optional free text: *"Anything to add?"* (280 char limit)
- [ ] "Save" button → calls `saveCheckIn()`, closes modal
- [ ] "Skip" button → closes modal, no entry saved

### History Tab Integration (`app/(tabs)/history.tsx`)
- [ ] Each day entry shows:
  - Clean day with check-in: mood emoji + note preview, tap to expand full note
  - Relapse day: red indicator + relapse count, tap to expand. If checked in that day, show mood below relapse info.
  - Days with no check-in: no journal indicator shown

---

## Feature 4 — Settings Screen

> Simple. Two options only.

- [ ] Create `app/settings.tsx`
- [ ] Add gear icon to home screen header linking to settings
- [ ] **Notification time** — show 3 presets, highlight current selection, reschedule on change
- [ ] **Restart round** — confirmation dialog: *"This will start a new 90-day round. Are you sure?"* → calls `startNewRound()`

---

## Pre-Submission Checklist

- [ ] Test full round cycle: day 1 → day 90 → summary screen → start Round 2
- [ ] Test round comparison: Round 2 summary shows improvement vs Round 1
- [ ] Test relapse flow: 1st, 2nd, 3rd+ same-day relapses show correct behavior
- [ ] Test relapse card: precise time under 24h, day count after 24h, never both
- [ ] Test notifications: delivery when app is closed, day count accurate
- [ ] Test check-in: card resets at midnight, modal saves, history shows entries
- [ ] Test on physical iOS device
- [ ] Bump version to `1.3.0` in `app.json`, increment `versionCode` to `3`
- [ ] Update App Store screenshots
- [ ] Privacy policy updated to mention notification usage

---

## Out of Scope for This Release

- ~~Insights / stats screen~~ — built early (round history cards, no check-in data yet)
- Custom notification time picker — presets are enough for v1, add later in settings
- Home screen widget
- Monetization / Pro tier
