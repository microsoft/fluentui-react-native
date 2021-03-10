import { ThemeReference } from '@fluentui-react-native/theme';
import { PartialTheme, Theme } from '@fluentui-react-native/theme-types';
import { Appearance, NativeModules } from 'react-native';
import { BaseAppleDarkThemeIOS, BaseAppleLightThemeIOS } from './appleTheme.ios';

// Save this value between calls
let partialThemeFromNativeModule: PartialTheme;

export function createAppleTheme(): ThemeReference {
  const baseAppleTheme = () => {
    const current = Appearance.getColorScheme();
    return current === 'light' ? BaseAppleLightThemeIOS : BaseAppleDarkThemeIOS;
  };

  const loadNativeTheme = (appleThemeReference: ThemeReference) => {
    const module = NativeModules && NativeModules.MSFAppleThemeModule;
    if (module) {
      module.getApplePartialThemeWithCallback((error, applePartialTheme) => {
        if (error) {
          console.error(`Error retrieving apple theming module! ${error}`);
        }
        partialThemeFromNativeModule = applePartialTheme;
        appleThemeReference.update(baseAppleTheme, partialThemeFromNativeModule);
      });
    } else {
      console.warn('Apple native theming module not found');
    }
  };

  const appleThemeReference = new ThemeReference({} as Theme, baseAppleTheme, partialThemeFromNativeModule);
  loadNativeTheme(appleThemeReference);

  Appearance.addChangeListener(() => {
    loadNativeTheme(appleThemeReference);
  });

  return appleThemeReference;
}
