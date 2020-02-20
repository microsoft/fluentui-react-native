import { createThemingModuleHelper } from './ThemingModuleHelpers';
import { useFakePalette } from './useFakePalette';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { IOfficeThemingModule } from '.';
import { createMockThemingModule } from './MockThemingModule';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: IOfficeThemingModule & EventSubscriptionVendor;
  }
}

const getThemingModule = () => {
  const themingModule = (NativeModules && NativeModules.Theming) || createMockThemingModule();
  !useFakePalette || console.warn('Web Debugging forces Theming Native Module to fallback to fake color values.');
  (NativeModules && NativeModules.Theming) || console.warn('No NativeModule for Theming found, using mock impl.');
  return useFakePalette
    ? {
        ...themingModule,
        getPalette: () => {
          return require('./office/debugpalette.json');
        }
      }
    : themingModule;
};

export const ThemingModuleHelper = createThemingModuleHelper(getThemingModule(), new NativeEventEmitter(NativeModules.Theming));
