import { OfficeThemingModule } from './officeThemingModule';
import { NativeEventEmitter } from 'react-native';
import { fallbackGetPalette, fallbackOfficeModule } from './fallbackOfficeModule';

declare module 'react-native' {
  interface ITurboModuleRegistry {
    get: (name: 'Theming') => OfficeThemingModule & EventSubscriptionVendor;
  }
  const win32TurboModuleRegistry: ITurboModuleRegistry;
}

import { win32TurboModuleRegistry } from 'react-native';

/**
 *  If we have a userAgent string, let's assume we're web debugging.  __DEV__ is for developer bundles.  Currently,
 *  react-native only polyfills navigator with { product: 'ReactNative', geolocation: NativeModules.Geolocation }
 */
function disableGetPalette(): boolean {
  const disabled = __DEV__ && navigator && navigator.userAgent !== undefined;
  disabled && console.warn(console.warn('Web Debugging forces Theming Native Module to fallback to fake color values.'));
  return disabled;
}

export function getThemingModule(): [OfficeThemingModule, NativeEventEmitter | undefined] {
  const module = win32TurboModuleRegistry.get('Theming');
  // if the native module exists return the module + an emitter for it
  if (module) {
    // mock getPalette if it should be disabled, otherwise return the module directly
    return [disableGetPalette() ? { ...module, getPalette: fallbackGetPalette } : module, new NativeEventEmitter(module)];
  }

  // otherwise use the fallback module
  return [fallbackOfficeModule, undefined];
}
