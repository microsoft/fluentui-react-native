import { ThemeHelper } from '@fluentui-react-native/use-styling';
import { Theme } from '@fluentui-react-native/theme-types';
import { useFluentTheme } from './useFluentTheme';

export const themeHelper: ThemeHelper<Theme> = {
  useTheme: () => useFluentTheme(),
  getComponentInfo: (theme: Theme, name: string) => {
    const components = theme.components || {};
    return components[name];
  },
};
