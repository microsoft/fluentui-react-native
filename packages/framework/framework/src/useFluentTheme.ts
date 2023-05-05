import { Platform } from 'react-native';

import { createAppleTheme } from '@fluentui-react-native/apple-theme';
import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import type { Theme } from '@fluentui-react-native/theme-types';
import { useTheme } from '@fluentui-react-native/theme-types';

/**
 * Attempts to obtain a theme via the react context, failing that the default fluent theme will be returned. Used to ensure some theme
 * object is provided for looking up color (and other) theme values
 * @returns - a valid Theme object
 */
export function useFluentTheme(): Theme {
  const themeFromContext = useTheme();

  if (themeFromContext) {
    return themeFromContext;
  }

  // TODO GH 2492: if no theme is provided via react context, we should return a theme appropriate to that platform
  // still to do for macOS/android/win32
  if (Platform.OS === 'ios') {
    return createAppleTheme().theme;
  }

  return defaultFluentTheme;
}
