import { ColorValue, OfficePalette, Typography } from '@fluentui-react-native/theme-types';
import { OfficeThemingModule } from './officeThemingModule';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { useFakePalette } from './useFakePalette';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: OfficeThemingModule & EventSubscriptionVendor;
  }
}

export const getThemingModule = () => {
  const themingModule = (NativeModules && NativeModules.Theming) || createMockThemingModule();
  !useFakePalette || console.warn('Web Debugging forces Theming Native Module to fallback to fake color values.');
  (NativeModules && NativeModules.Theming) || console.warn('No NativeModule for Theming found, using mock impl.');
  return useFakePalette
    ? {
        ...themingModule,
        getPalette: () => {
          return require('./office/debugpalette.json');
        },
      }
    : themingModule;
};
