import { ThemeReference } from '@fluentui-react-native/theme';
import { NativeModules } from 'react-native';
import { BaseAppleThemeMacOS } from './appleTheme.macos';

export function createAppleTheme(): ThemeReference {
  const appleThemeReference: ThemeReference = new ThemeReference(BaseAppleThemeMacOS);

  const module = NativeModules && NativeModules.MSFAppleThemeModule;
  if (module) {
    module.getApplePartialThemeWithCallback((error, applePartialTheme) => {
      if (error) {
        console.error(`Error retrieving apple theming module! ${error}`);
      }
      // Layer the native apple theming module values on top of the base Apple theme

      // TODO this doesn't work. Why?
      // appleThemeReference.update(applePartialTheme);
      // Set the individual properties instead
      appleThemeReference.theme.typography = applePartialTheme.typography;
      appleThemeReference.invalidate();
    });
  } else {
    console.warn('Apple native theming module not found');
  }

  return appleThemeReference;
}
