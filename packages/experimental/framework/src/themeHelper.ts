import * as React from 'react';
import { ThemeHelper } from '@fluentui-react-native/use-styling';
import { Theme, ThemeContext } from '@fluentui-react-native/theme-types';
import { defaultFluentTheme } from '@fluentui-react-native/default-theme';

export const themeHelper: ThemeHelper<Theme> = {
  useTheme: () => {
    return React.useContext(ThemeContext) || defaultFluentTheme;
  },
  getComponentInfo: (theme: Theme, name: string) => {
    const components = theme.componentTokens || {};
    return components[name];
  },
};
