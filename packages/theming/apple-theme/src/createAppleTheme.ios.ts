import { ThemeReference } from '@fluentui-react-native/theme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';

export function createAppleTheme(): ThemeReference {
  // ADO #4832321
  console.warn('iOS Theme not currently implemented, using default theme');
  return new ThemeReference(createDefaultTheme());
}
