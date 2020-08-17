import * as React from 'react';
import { ThemeHelper } from '@fluentui-react-native/use-styling';
import { ITheme } from '@uifabricshared/theming-ramp';
import { ThemeContext, getTheme } from '@uifabricshared/theming-react-native';

export const themeHelper: ThemeHelper<ITheme> = {
  useTheme: () => {
    return React.useContext(ThemeContext) || getTheme();
  },
  getComponentInfo: (theme: ITheme, name: string) => {
    const components = theme.componentTokens || {};
    return components[name];
  }
};
