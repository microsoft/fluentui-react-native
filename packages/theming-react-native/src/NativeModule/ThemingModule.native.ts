import { createThemingModuleHelper } from './ThemingModuleHelpers';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { IOfficeThemingModule } from '.';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: IOfficeThemingModule & EventSubscriptionVendor;
  }
}

const getThemingModule = () => {
  return __DEV__
    ? {
        ...NativeModules.Theming,
        getPalette: () => {
          return require('./office/debugpalette.json');
        }
      }
    : NativeModules.Theming;
};

export const ThemingModuleHelper = createThemingModuleHelper(getThemingModule(), new NativeEventEmitter(NativeModules.Theming));
