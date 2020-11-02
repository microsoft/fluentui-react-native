import { ThemeHelper } from '@fluentui-react-native/use-styling';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { defaultFluentTheme } from '@fluentui-react-native/default-theme';

export const themeHelper: ThemeHelper<Theme> = {
  useTheme: () => useTheme() || defaultFluentTheme,
  getComponentInfo: (theme: Theme, name: string) => {
    const components = theme.components || {};
    return components[name];
  },
};
