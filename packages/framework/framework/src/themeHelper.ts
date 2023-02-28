import type { Theme } from '@fluentui-react-native/theme-types';
import type { ThemeHelper } from '@fluentui-react-native/use-styling';

import { useFluentTheme } from './useFluentTheme';

export const themeHelper: ThemeHelper<Theme> = {
  useTheme: () => useFluentTheme(),
  getComponentInfo: (theme: Theme, name: string) => {
    const components = theme.components || {};
    return components[name];
  },
};
