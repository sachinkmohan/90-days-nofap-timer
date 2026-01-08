# 90-Day NoFap Timer App - Implementation Plan

## Overview

A minimal, calming 90-day timer app. Timer starts on first launch, shows live countdown (days/hours/minutes/seconds), allows reset with optional trigger logging, celebrates 90-day milestone, and continues counting beyond.

## Data Model (AsyncStorage)

```typescript
interface TimerState {
  startDate: string; // ISO timestamp when current streak began
}

interface ResetEntry {
  id: string; // UUID
  resetDate: string; // ISO timestamp
  trigger: string; // Brief note (max 50 chars)
  streakDays: number; // Days achieved before reset
}
```

**Storage Keys:** `@timer_state`, `@reset_history`, `@celebration_shown`

---

## Files to Create

### Types & Services

| File                  | Purpose               |
| --------------------- | --------------------- |
| `types/timer.ts`      | TypeScript interfaces |
| `services/storage.ts` | AsyncStorage wrapper  |

### Hooks & Context

| File                         | Purpose                            |
| ---------------------------- | ---------------------------------- |
| `contexts/timer-context.tsx` | Global timer state & actions       |
| `hooks/use-countdown.ts`     | Live-updating days/hours/mins/secs |

### Components

| File                                  | Purpose                           |
| ------------------------------------- | --------------------------------- |
| `components/timer/timer-display.tsx`  | Large timer showing DD:HH:MM:SS   |
| `components/timer/reset-button.tsx`   | Press-and-hold reset with haptics |
| `components/timer/progress-bar.tsx`   | Progress toward 90 days           |
| `components/history/history-item.tsx` | Single reset entry row            |

### Screens

| File                        | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `app/(tabs)/index.tsx`      | **Replace** - Main timer screen               |
| `app/(tabs)/history.tsx`    | **New** - Past resets list (replaces explore) |
| `app/reset-modal.tsx`       | Reset confirmation + trigger input            |
| `app/celebration-modal.tsx` | 90-day milestone celebration                  |

---

## Files to Modify

| File                     | Changes                                             |
| ------------------------ | --------------------------------------------------- |
| `app/_layout.tsx`        | Wrap with TimerProvider, add modal routes           |
| `app/(tabs)/_layout.tsx` | Rename tabs: Timer + History, update icons          |
| `constants/theme.ts`     | Add timer colors (progress green, muted reset gray) |
| `package.json`           | Add `@react-native-async-storage/async-storage`     |

---

## Implementation Order

### Phase 1: Foundation

1. `npx expo install @react-native-async-storage/async-storage`
2. Create `types/timer.ts`
3. Create `services/storage.ts`
4. Update `constants/theme.ts` with timer colors

### Phase 2: Core Logic

5. Create `hooks/use-countdown.ts` (1-second interval, calculates elapsed time)
6. Create `contexts/timer-context.tsx` (loads/saves state, provides reset action)

### Phase 3: Timer Screen

7. Create `components/timer/timer-display.tsx`
8. Create `components/timer/progress-bar.tsx`
9. Create `components/timer/reset-button.tsx`
10. Replace `app/(tabs)/index.tsx` with timer screen

### Phase 4: Reset Flow

11. Create `app/reset-modal.tsx` (quick trigger input, optional)
12. Create `app/celebration-modal.tsx` (confetti, continue button)
13. Update `app/_layout.tsx` to add modal routes + TimerProvider

### Phase 5: History

14. Create `components/history/history-item.tsx`
15. Create `app/(tabs)/history.tsx`
16. Update `app/(tabs)/_layout.tsx` (rename tabs, update icons)
17. Delete `app/(tabs)/explore.tsx`

---

## UI Polish (Current Task)

### Color Palette Update

Replace the generic greens/grays with a calming, supportive palette:

**Light mode:**

- Background: Soft warm white `#FAFAF8`
- Timer text: Deep slate `#1E293B`
- Secondary text: Muted slate `#64748B`
- Progress fill: Soft teal `#14B8A6` (calming, not too bright)
- Progress track: Light gray `#E2E8F0`
- Milestone markers: Subtle gold `#D4A574` (achieved) / light gray (upcoming)
- Reset button: Muted rose `#9F8A8A` (not alarming red)

**Dark mode:**

- Background: Deep charcoal `#0F172A`
- Timer text: Warm white `#F8FAFC`
- Secondary text: Muted blue-gray `#94A3B8`
- Progress fill: Teal `#2DD4BF`
- Progress track: Dark slate `#334155`
- Milestone markers: Warm gold `#D4A574` (achieved) / dark gray (upcoming)
- Reset button: Muted rose `#A78B8B`

### Milestone Markers on Progress Bar

Add subtle dot markers at key milestones: **7, 14, 30, 60, 90 days**

Visual design:

- Small dots (6px) positioned along the progress track
- Achieved milestones: filled with gold accent color
- Upcoming milestones: hollow/outlined, very subtle
- No labels on the bar itself (keep it clean)
- Tooltip or subtle glow only if user taps a milestone (optional)

Implementation:

- Calculate milestone positions as percentages: 7/90=7.8%, 14/90=15.6%, 30/90=33.3%, 60/90=66.7%, 90/90=100%
- Render dots at absolute positions on the track
- Compare current progress to determine filled vs hollow state

### Files to Modify

- `constants/theme.ts` - Update color palette
- `components/timer/progress-bar.tsx` - Add milestone dots

---

## Original UI Decisions

**Timer Screen:**

- Large, prominent day count as hero element
- HH:MM:SS below in smaller text
- Progress bar showing % toward 90 days with milestone markers
- Reset button at bottom, muted color, requires press-and-hold (500ms)

**Reset Modal:**

- Soft, non-judgmental language ("What triggered this? (optional)")
- Quick suggestion chips: "Stress", "Boredom", "Loneliness", "Other"
- Text input limited to 50 chars
- Cancel + Reset buttons

**Celebration Modal:**

- Animated confetti
- "90 Days Achieved!" message
- Encouraging text
- "Continue Journey" button (timer keeps counting)

---

## Future Enhancement Ideas (To Review Later)

**Content additions:**

- Motivational message - Short encouraging phrase that changes daily or based on progress
- Next milestone indicator - "X days until next milestone" below progress bar
- Time-of-day greeting - "Good morning" / "Good evening" at top

**Visual enhancements:**

- Subtle background gradient - Soft gradient instead of flat color
- Timer glow/shadow - Subtle shadow behind day number for depth
- Streak fire/flame icon - Animated flame that grows with streak length

**Interactions:**

- Milestone mini-celebration - Brief animation when opening app after hitting any milestone
- Tap for details - Tap timer to see "Started on [date]" or streak stats

---

## Verification

1. **Fresh install test:** Open app, timer should start immediately at 0
2. **Timer accuracy:** Background app for 1+ minutes, reopen - time should be accurate
3. **Reset flow:** Tap reset, enter trigger, confirm - timer resets, history entry created
4. **90-day test:** Manually set startDate to 90 days ago in storage, reopen app - celebration should appear
5. **History:** After multiple resets, history screen shows all entries with dates and triggers
6. **Theme:** Toggle device dark mode - all screens should adapt correctly
