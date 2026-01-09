/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#14B8A6';
const tintColorDark = '#2DD4BF';

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#FAFAF8',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorLight,
    // Timer-specific colors
    timerText: '#1E293B',
    timerSecondary: '#64748B',
    progressFill: '#14B8A6',
    progressTrack: '#E2E8F0',
    milestoneAchieved: '#D4A574',
    milestoneUpcoming: '#CBD5E1',
    resetButton: '#9F8A8A',
    resetButtonPressed: '#E57373',
    celebration: '#D4A574',
    cardBackground: '#FFFFFF',
    border: '#E2E8F0',
    // Dev mode colors
    devModeBanner: '#F59E0B',
    devModeText: '#92400E',
    devModeBackground: '#FEF3C7',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorDark,
    // Timer-specific colors
    timerText: '#F8FAFC',
    timerSecondary: '#94A3B8',
    progressFill: '#2DD4BF',
    progressTrack: '#334155',
    milestoneAchieved: '#D4A574',
    milestoneUpcoming: '#475569',
    resetButton: '#A78B8B',
    resetButtonPressed: '#EF9A9A',
    celebration: '#D4A574',
    cardBackground: '#1E293B',
    border: '#334155',
    // Dev mode colors
    devModeBanner: '#F59E0B',
    devModeText: '#FEF3C7',
    devModeBackground: 'rgba(217, 119, 6, 0.2)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
