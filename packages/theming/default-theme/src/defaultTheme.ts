import { getDefaultLegacyTheme } from '@fluentui-react-native/design/theming/compat/defaults';

export const defaultFluentTheme = getDefaultLegacyTheme({
  colorScheme: 'light',
  contrast: 'standard',
  interfaceLevel: 'base',
});

export const defaultFluentDarkTheme = getDefaultLegacyTheme({
  colorScheme: 'dark',
  contrast: 'standard',
  interfaceLevel: 'base',
});

export const defaultFluentHighConstrastTheme = getDefaultLegacyTheme({
  colorScheme: 'dark',
  contrast: 'highContrast',
  interfaceLevel: 'base',
});
