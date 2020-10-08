import * as React from 'react';
import { IThemeProviderProps } from './ThemeProvider.types';
import { useThemeRegistry, ThemeRegistryContext } from './ThemeContext';
import { IThemeEventListener } from '@uifabricshared/theme-registry';
import { getThemeRegistry } from './Global';
import { ThemeContext } from '@uifabricshared/theming-ramp';

export const ThemeProvider: React.FunctionComponent<IThemeProviderProps> = (props: IThemeProviderProps) => {
  const { registry: registryFromProps, theme: themeName = '', children } = props;
  const registryToUse = registryFromProps || useThemeRegistry() || getThemeRegistry();
  const [theme, setThemeState] = React.useState(registryToUse.getTheme(themeName));

  React.useEffect(() => {
    setThemeState(registryToUse.getTheme(themeName));

    const themeInvalidater: IThemeEventListener = {
      onInvalidate: (name: string) => {
        name === themeName && setThemeState(registryToUse.getTheme(themeName));
      },
    };

    registryToUse.addEventListener(themeInvalidater);
    return () => {
      registryToUse.removeEventListener(themeInvalidater);
    };
  }, [registryToUse, themeName, setThemeState]);

  const themeProvider = <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;

  // note `registryFromProps` came from props and it's not the same as `registryToUse`
  return registryFromProps ? (
    <ThemeRegistryContext.Provider value={registryFromProps}>{themeProvider}</ThemeRegistryContext.Provider>
  ) : (
    themeProvider
  );
};
