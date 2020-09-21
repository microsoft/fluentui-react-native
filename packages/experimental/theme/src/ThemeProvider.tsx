import * as React from 'react';
import { ThemeReference } from './themeReference';
import { ITheme } from '@fluentui-react-native/theme-types';

export interface ThemeProviderProps extends React.PropsWithChildren<{}> {
  /**
   * to set themes into the provider wrap them in a reference
   */
  theme: ThemeReference;
}

/**
 * TODO: Currently copied from theming-react-native package, this should be shared as both old and new still use the same type of theme object
 */
export const ThemeContext = React.createContext<ITheme>(undefined);
export const useTheme = () => React.useContext(ThemeContext);

export const ThemeProvider: React.FunctionComponent<ThemeProviderProps> = (props: ThemeProviderProps) => {
  const { theme: themeRef, children } = props;
  const [theme, setThemeState] = React.useState(() => themeRef.theme);

  React.useEffect(() => {
    const onInvalidate = () => {
      setThemeState(themeRef.theme);
    };

    themeRef.addOnThemeChanged(onInvalidate);
    return () => {
      themeRef.removeOnThemeChanged(onInvalidate);
    };
  }, [themeRef, setThemeState]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
