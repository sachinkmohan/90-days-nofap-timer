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
  - `(tabs)/` - Tab group with Home and Explore screens
  - `modal.tsx` - Modal screen example
- `components/` - Reusable UI components with theme support
- `constants/theme.ts` - Color palette and font definitions for light/dark modes
- `hooks/` - Custom hooks including `useColorScheme` and `useThemeColor`

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
