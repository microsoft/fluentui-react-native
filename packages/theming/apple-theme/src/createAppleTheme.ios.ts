import { ThemeReference } from '@fluentui-react-native/theme';
import { PartialTheme } from '@fluentui-react-native/theme-types';
import { Appearance, NativeEventEmitter, NativeModules, useColorScheme } from 'react-native';
import { BaseAppleDarkThemeIOS, BaseAppleLightThemeIOS } from './appleTheme.ios';

// // Save this value between calls
// let partialThemeFromNativeModule: PartialTheme;

// const appleThemeReference = new ThemeReference(Appearance.getColorScheme() === 'light' ? BaseAppleLightThemeIOS : BaseAppleDarkThemeIOS);

// export function createAppleTheme(): ThemeReference {
//   console.log('creating theme');

//   // const module = NativeModules && NativeModules.MSFAppleThemeModule;
//   // if (module) {
//   //   module.getApplePartialThemeWithCallback((error, applePartialTheme) => {
//   //     if (error) {
//   //       console.error(`Error retrieving apple theming module! ${error}`);
//   //     }
//   //     partialThemeFromNativeModule = applePartialTheme;

//   //     // Layer the native apple theming module values on top of the base Apple theme
//   //     appleThemeReference.update(applePartialTheme);
//   //   });

//   //   const emitter = new NativeEventEmitter(module);

//   //   const onAppleThemeChanged = (body: PartialTheme) => {
//   //     partialThemeFromNativeModule = body;
//   //     appleThemeReference.update(partialThemeFromNativeModule);
//   //   };

//   //   emitter.addListener('traitCollectionDidChange', onAppleThemeChanged);
//   // } else {
//   //   console.warn('Apple native theming module not found');
//   // }

//   // appleThemeReference.update(partialThemeFromNativeModule);

//   Appearance.addChangeListener(() => {
//     console.log('Appearance changed!');
//     appleThemeReference.invalidate();
//   });

//   return appleThemeReference;
// }

export function createAppleTheme(): ThemeReference {
  const themeRef = new ThemeReference({} as Theme, () => {
    console.log('creating theme');
    const current = Appearance.getColorScheme();
    return current === 'light' ? BaseAppleLightThemeIOS : BaseAppleDarkThemeIOS;
  });

  Appearance.addChangeListener(() => {
    console.log('Appearance changed!');
    themeRef.invalidate();
  });

  return themeRef;
}
