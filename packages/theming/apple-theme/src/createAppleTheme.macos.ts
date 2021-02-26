import { ThemeReference } from '@fluentui-react-native/theme';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { BaseAppleThemeMacOS } from './appleTheme.macos';

// TODO: There are some unresolved bugs with the native module, so let's use the fallback JS theme instead
const useNativeThemingModule = false;

export function createAppleTheme(): ThemeReference {
  const appleThemeReference: ThemeReference = new ThemeReference(BaseAppleThemeMacOS);

  if (useNativeThemingModule) {
    const module = NativeModules && NativeModules.MSFAppleThemeModule;
    if (module) {
      module.getApplePartialThemeWithCallback((error, applePartialTheme) => {
        if (error) {
          console.error(`Error retrieving apple theming module! ${error}`);
        }
        console.log('Loaded apple theming module');
        console.log(applePartialTheme.colors.background);

        // Layer the native apple theming module values on top of the base Apple theme

        // TODO this doesn't work. Why?
        // appleThemeReference.update(applePartialTheme);

        appleThemeReference.theme.colors = applePartialTheme.colors;
        appleThemeReference.theme.typography = applePartialTheme.typography;
        appleThemeReference.invalidate();
      });

      const emitter = new NativeEventEmitter(module);

      const onAppleThemeChanged = () => {
        console.log('Received apple theming module native event');
        appleThemeReference.invalidate();
      };

      emitter.addListener('AppleInterfaceThemeChanged', onAppleThemeChanged);
      emitter.addListener('AppleColorPreferencesChanged', onAppleThemeChanged);
    } else {
      console.warn('Apple native theming module not found');
    }
  }

  return appleThemeReference;
}
