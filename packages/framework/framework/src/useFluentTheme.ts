import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';

/**
 * Attempts to obtain a theme via the react context, failing that the default fluent theme will be returned. Used to ensure some theme
 * object is provided for looking up color (and other) theme values
 * @returns - a valid Theme object
 */
export function useFluentTheme(): Theme {
  return useTheme() || defaultFluentTheme;
}
