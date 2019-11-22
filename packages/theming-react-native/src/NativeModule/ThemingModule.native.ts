import { createThemingModuleHelper } from './ThemingModuleHelpers';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { IOfficeThemingModule } from '.';
import { createMockThemingModule } from './MockThemingModule';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: IOfficeThemingModule & EventSubscriptionVendor;
  }
}

/**
 *  If we have a userAgent string, let's assume we're web debugging.  __DEV__ is for developer bundles.  Currently,
 *  react-native only polyfills navigator with { product: 'ReactNative', geolocation: NativeModules.Geolocation }
 */
const isWebDebugging = navigator && navigator.userAgent !== undefined;

const getThemingModule = () => {
  const themingModule = (NativeModules && NativeModules.Theming) || createMockThemingModule();
  !isWebDebugging || console.warn('Web Debugging forces Theming Native Module to fallback to fake color values.');
  (NativeModules && NativeModules.Theming) || console.warn('No NativeModule for Theming found, using mock impl.');
  return isWebDebugging && __DEV__
    ? {
        ...themingModule,
        getPalette: () => {
          return require('./office/debugpalette.json');
        }
      }
    : themingModule;
};

export const ThemingModuleHelper = createThemingModuleHelper(getThemingModule(), new NativeEventEmitter(NativeModules.Theming));
