import { ThemeReference } from '@fluentui-react-native/theme';
import { PartialTheme, Theme } from '@fluentui-react-native/theme-types';
import { Appearance, NativeEventEmitter, NativeModules, useColorScheme } from 'react-native';
import { BaseAppleDarkThemeIOS, BaseAppleLightThemeIOS } from './appleTheme.ios';

// Try 1 (Bad)

// // Save this value between calls
// let partialThemeFromNativeModule: PartialTheme;
//
// export function createAppleTheme(): ThemeReference {
//   console.log('creating theme');

//   const baseAppleTheme = () => {
//     console.log('creating theme');
//     const current = Appearance.getColorScheme();
//     return current === 'light' ? BaseAppleLightThemeIOS : BaseAppleDarkThemeIOS;
//   };

//   const appleThemeReference = new ThemeReference({} as Theme, baseAppleTheme);

//   const module = NativeModules && NativeModules.MSFAppleThemeModule;
//   if (module) {
//     module.getApplePartialThemeWithCallback((error, applePartialTheme) => {
//       if (error) {
//         console.error(`Error retrieving apple theming module! ${error}`);
//       }
//       partialThemeFromNativeModule = applePartialTheme;

//       // Layer the native apple theming module values on top of the base Apple theme
//       appleThemeReference.update(baseAppleTheme, applePartialTheme);
//     });
//   } else {
//     console.warn('Apple native theming module not found');
//   }

//   Appearance.addChangeListener(() => {
//     console.log('Appearance changed!');
//     appleThemeReference.invalidate();
//   });

//   return appleThemeReference;
// }

// Try 2 (Good)

// Save this value between calls
let partialThemeFromNativeModule: PartialTheme;

export function createAppleTheme(): ThemeReference {
  const baseAppleTheme = () => {
    console.log('creating theme');
    const current = Appearance.getColorScheme();
    return current === 'light' ? BaseAppleLightThemeIOS : BaseAppleDarkThemeIOS;
  };

  const nativeThemeCallback = (appleThemeReference: ThemeReference) => {
    const module = NativeModules && NativeModules.MSFAppleThemeModule;
    if (module) {
      console.log('Calling Native module once more');
      module.getApplePartialThemeWithCallback((error, applePartialTheme) => {
        if (error) {
          console.error(`Error retrieving apple theming module! ${error}`);
        }
        partialThemeFromNativeModule = applePartialTheme;
        appleThemeReference.update(baseAppleTheme, partialThemeFromNativeModule);
        appleThemeReference.invalidate();
        console.log('Native Module loaded, themeRef invalidated, appearance: ' + partialThemeFromNativeModule.host.appearance);
      });
    } else {
      console.warn('Apple native theming module not found');
    }
  };

  const themeRef = new ThemeReference({} as Theme, baseAppleTheme, partialThemeFromNativeModule);
  nativeThemeCallback(themeRef);

  Appearance.addChangeListener(() => {
    console.log('Appearance changed!');
    nativeThemeCallback(themeRef);
  });

  return themeRef;
}

// Try 3 (Bad)

// // Save this value between calls
// let partialThemeFromNativeModule: PartialTheme;

// export function createAppleTheme(): ThemeReference {
//   const baseAppleTheme = () => {
//     console.log('creating theme');
//     const current = Appearance.getColorScheme();
//     return current === 'light' ? BaseAppleLightThemeIOS : BaseAppleDarkThemeIOS;
//   };

//   const nativeTheme = () => {
//     const module = NativeModules && NativeModules.MSFAppleThemeModule;
//     if (module) {
//       console.log('Calling Native module once more');
//       module.getApplePartialThemeWithCallback((error, applePartialTheme) => {
//         if (error) {
//           console.error(`Error retrieving apple theming module! ${error}`);
//         }
//         partialThemeFromNativeModule = applePartialTheme;
//         console.log('Native Module loaded, themeRef invalidated, appearance: ' + partialThemeFromNativeModule.host.appearance);
//       });
//     } else {
//       console.warn('Apple native theming module not found');
//     }

//     return partialThemeFromNativeModule;
//   };

//   const themeRef = new ThemeReference({} as Theme, baseAppleTheme, nativeTheme);

//   Appearance.addChangeListener(() => {
//     console.log('Appearance changed!');
//     themeRef.invalidate;
//   });

//   return themeRef;
// }
