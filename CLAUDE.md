# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm install          # Install dependencies
npx expo start       # Start development server (or npm start)
npm run ios          # Start on iOS simulator
npm run android      # Start on Android emulator
npm run web          # Start web version
npm run lint         # Run ESLint
npm run reset-project # Move starter code to app-example and create fresh app directory
```

## Architecture

This is an Expo SDK 54 React Native app using:
- **expo-router** for file-based routing with typed routes enabled
- **React Navigation** bottom tabs for the main navigation
- **react-native-reanimated** for animations
- React 19 with the React Compiler experiment enabled

### Project Structure

- `app/` - File-based routing (expo-router)
  - `_layout.tsx` - Root layout with ThemeProvider and Stack navigator
  - `(tabs)/` - Tab group: `index.tsx` (home), `history.tsx`, `insights.tsx`
  - `onboarding.tsx` - Date-picker onboarding flow (shown on first launch)
  - `relapse-modal.tsx` - Chaser effect modal (replaces old reset-modal)
  - `round-summary.tsx` - End-of-round summary screen
  - `dev-menu-modal.tsx` - Dev tools (5-tap History tab to open)
- `components/` - Reusable UI components with theme support
  - `components/timer/relapse-card.tsx` - Relapse status + "Log a relapse →"
  - `components/timer/checkin-card.tsx` - Daily check-in prompt or completed state
  - `components/timer/progress-bar.tsx` - Accepts `dayInRound`, computes progress internally
  - `components/calendar/calendar-grid.tsx` - Accepts `RelapseEvent[]`, shows `×N` on relapse days
- `constants/theme.ts` - Color palette and font definitions for light/dark modes
- `contexts/timer-context.tsx` - Central app state; `allRounds` and `currentRound` are kept in sync — mutations (`logRelapse`, `finishRound`, `devSeedRelapses`) update both. Exposes `useTimer()`
- `hooks/` - Custom hooks including `useColorScheme` and `useThemeColor`
- `services/storage.ts` - AsyncStorage persistence layer (`StorageService`)
- `services/dev-storage.ts` - Dev-mode storage helpers and presets
- `utils/onboarding.ts` - Pure helpers: `isValidStartDate`, `isPastDate`, `shouldSkipOnboarding`, `MAX_DAYS_AGO`
- `utils/calendar.ts` - Calendar computation helpers
- `utils/rounds.ts` - Pure helpers: `getDayInRound`, `getDaysSinceLastRelapse`, `getRelapseCountToday`
- `utils/relapse-card.ts` - Pure helpers: `getRelapseCardDisplayMode`, `getRelapsesForDay`, `getRelapseMessage`
- `utils/round-summary.ts` - Pure helpers: `getLongestCleanStreak`, `getRoundComparison`, `getRoundDuration`
- `types/timer.ts` - Shared TypeScript interfaces: `Round`, `RelapseEvent`, `CheckInEntry`, `CalendarEvent`, `DevModeState`
- `__tests__/` - Jest unit tests (no React component tests; pure logic and storage only)

### Theming Pattern

The app uses a consistent theming approach:
1. `Colors` object in `constants/theme.ts` defines light/dark color palettes
2. `useColorScheme()` hook detects system theme preference
3. `useThemeColor()` hook resolves colors based on current theme
4. `ThemedText` and `ThemedView` components automatically apply theme colors

### Path Aliases

Use `@/` to import from the project root (configured in tsconfig.json):
```typescript
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
```
