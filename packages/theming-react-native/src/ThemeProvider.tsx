import * as React from 'react';
import { IThemeProviderProps } from './ThemeProvider.types';
import { useThemeRegistry, ThemeRegistryContext } from './ThemeContext';
import { ThemeContext } from './ThemeLayer';
import { IThemeEventListener } from '@uifabricshared/theme-registry';
import { getThemeRegistry } from './Global';

export const ThemeProvider: React.FunctionComponent<IThemeProviderProps> = (props: IThemeProviderProps) => {
  const { themeRegistry, themeName = '', children } = props;
  const registry = themeRegistry || useThemeRegistry() || getThemeRegistry();
  const [theme, setThemeState] = React.useState(registry.getTheme(themeName));

  React.useEffect(() => {
    const themeInvalidater: IThemeEventListener = {
      onInvalidate: (name: string) => {
        name === themeName && setThemeState(registry.getTheme(themeName));
      }
    };

    registry.addEventListener(themeInvalidater);
    return () => {
      registry.removeEventListener(themeInvalidater);
    };
  }, [registry, themeName, setThemeState]);

  const themeProvider = <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;

  // note `themeRegistry` came from props and it's not the same as `registry`
  return themeRegistry ? (
    <ThemeRegistryContext.Provider value={themeRegistry}>{themeProvider}</ThemeRegistryContext.Provider>
  ) : (
    themeProvider
  );
};
