import { NativeEventEmitter, TurboModuleRegistry } from 'react-native';

import { fallbackGetPalette, fallbackOfficeModule } from './fallbackOfficeModule';
import { setCurrentHostThemeSetting } from './hostThemeSetting';
import type { OfficeThemingModule } from './officeThemingModule';

/**
 *  If we have a userAgent string, let's assume we're web debugging.  __DEV__ is for developer bundles.  Currently,
 *  react-native only polyfills navigator with { product: 'ReactNative', geolocation: NativeModules.Geolocation }
 */

function disableGetPalette(): boolean {
  const disabled = __DEV__ && typeof globalThis.navigator !== 'undefined' && globalThis.navigator.userAgent !== undefined;
  disabled && console.warn(console.warn('Web Debugging forces Theming Native Module to fallback to fake color values.'));
  return disabled;
}

function themeGetConstants(): ReturnType<OfficeThemingModule['getConstants']> {
  return themingModuleConstants;
}

let themingModule: OfficeThemingModule = undefined;
let themingModuleConstants: ReturnType<OfficeThemingModule['getConstants']> = undefined;
let themingModuleEmitter: NativeEventEmitter = undefined;
export function getThemingModule(): [OfficeThemingModule, NativeEventEmitter | undefined] {
  if (!themingModule) {
    const module = TurboModuleRegistry.get<OfficeThemingModule>('Theming');
    // if the native module exists return the module + an emitter for it
    if (module) {
      if (!isInstantiated) {
        // We need to store the host theme so that when themes are created
        // they can use this information.
        setCurrentHostThemeSetting(module.getConstants().initialHostThemeSetting);
        isInstantiated = true;
      }

      // Cache the result of getConstants to avoid continuous Native->JS marshalling
      themingModuleConstants = module.getConstants();

      // mock getPalette if it should be disabled
      if (disableGetPalette()) {
        themingModule = { ...module, getPalette: fallbackGetPalette, getConstants: themeGetConstants };
      } else {
        themingModule = { ...module, getPalette: module.getPalette, getConstants: themeGetConstants };
      }
      themingModuleEmitter = new NativeEventEmitter(module);
    } else {
      themingModule = fallbackOfficeModule;
    }
  }

  return [themingModule, themingModuleEmitter];
}

let isInstantiated = false;
