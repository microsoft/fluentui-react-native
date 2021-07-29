import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';

export function useFluentTheme(): Theme {
  return useTheme() || defaultFluentTheme;
}
