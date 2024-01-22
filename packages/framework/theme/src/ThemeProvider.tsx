import * as React from 'react';

import { ThemeContext } from '@fluentui-react-native/theme-types';

import type { ThemeReference } from './themeReference';

export interface ThemeProviderProps extends React.PropsWithChildren<Record<string, unknown>> {
  /**
   * to set themes into the provider wrap them in a reference
   */
  theme: ThemeReference;
}

export const ThemeProvider: React.FunctionComponent<ThemeProviderProps> = (props: ThemeProviderProps) => {
  const { theme: themeRef, children } = props;
  const [theme, setThemeState] = React.useState(() => themeRef.theme);

  React.useEffect(() => {
    // If the theme passed by prop is different, we directly update state. We also add a listener to update state if there's a change within the passed theme.
    setThemeState(themeRef.theme);

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
