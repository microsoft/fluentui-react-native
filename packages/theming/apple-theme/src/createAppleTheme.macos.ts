import { ThemeReference } from '@fluentui-react-native/theme';
import { PartialTheme } from '@fluentui-react-native/theme-types';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { BaseAppleThemeMacOS } from './appleTheme.macos';

// Save this value between calls
let partialThemeFromNativeModule: PartialTheme;

const appleThemeReference = new ThemeReference(BaseAppleThemeMacOS);

export function createAppleTheme(): ThemeReference {
  const module = NativeModules && NativeModules.MSFAppleThemeModule;
  if (module) {
    module.getApplePartialThemeWithCallback((error, applePartialTheme) => {
      if (error) {
        console.error(`Error retrieving apple theming module! ${error}`);
      }
      partialThemeFromNativeModule = applePartialTheme;

      // Layer the native apple theming module values on top of the base Apple theme
      appleThemeReference.update(applePartialTheme);
    });

    const emitter = new NativeEventEmitter(module);

    const onAppleThemeChanged = (body: PartialTheme) => {
      partialThemeFromNativeModule = body;
      appleThemeReference.update(body);
    };

    emitter.addListener('AppleInterfaceThemeChanged', onAppleThemeChanged);
    emitter.addListener('AppleColorPreferencesChanged', onAppleThemeChanged);
  } else {
    console.warn('Apple native theming module not found');
  }

  appleThemeReference.update(partialThemeFromNativeModule);

  return appleThemeReference;
}
