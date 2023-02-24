import type { EventSubscriptionVendor, TurboModule } from 'react-native';
import { NativeEventEmitter, TurboModuleRegistry } from 'react-native';

import { fallbackGetPalette, fallbackOfficeModule } from './fallbackOfficeModule';
import type { OfficeThemingModule } from './officeThemingModule';

/**
 *  If we have a userAgent string, let's assume we're web debugging.  __DEV__ is for developer bundles.  Currently,
 *  react-native only polyfills navigator with { product: 'ReactNative', geolocation: NativeModules.Geolocation }
 */

type ITurboModuleRegistry = TurboModule & OfficeThemingModule & EventSubscriptionVendor;

function disableGetPalette(): boolean {
  const disabled = __DEV__ && navigator && navigator.userAgent !== undefined;
  disabled && console.warn(console.warn('Web Debugging forces Theming Native Module to fallback to fake color values.'));
  return disabled;
}

export function getThemingModule(): [OfficeThemingModule, NativeEventEmitter | undefined] {
  const module = TurboModuleRegistry.get<ITurboModuleRegistry>('Theming');
  // if the native module exists return the module + an emitter for it
  if (module) {
    // mock getPalette if it should be disabled, otherwise return the module directly
    return [disableGetPalette() ? { ...module, getPalette: fallbackGetPalette } : module, new NativeEventEmitter(module)];
  }

  // otherwise use the fallback module
  return [fallbackOfficeModule, undefined];
}
