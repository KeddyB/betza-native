/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#22c55e'; // Green from betzastore.online
const tintColorDark = '#34d399'; // Lighter green for dark mode accent

export const Colors = {
  light: {
    text: '#11181C', // Dark gray
    background: '#f5f5f5', // Light gray
    primary: '#22c55e', // Green
    secondary: '#1e293b', // Dark blue-gray
    accent: '#facc15', // Yellow
    card: '#fff', // White for cards
    border: '#e2e8f0', // Light border
    notification: '#ef4444', // Red for errors/notifications
    inputBackground: '#e2e8f0', // Lighter background for inputs
    inputText: '#11181C',
    link: '#0a7ea4',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE', // Light gray
    background: '#0f172a', // Dark blue
    primary: '#34d399', // Lighter green
    secondary: '#334155', // Medium blue-gray
    accent: '#facc15', // Yellow
    card: '#1e293b', // Dark blue-gray for cards
    border: '#334155', // Darker border
    notification: '#dc2626', // Darker red
    inputBackground: '#1e293b', // Darker background for inputs
    inputText: '#ECEDEE',
    link: '#60a5fa',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
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
