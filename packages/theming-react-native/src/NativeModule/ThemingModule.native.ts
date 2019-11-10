import { NativeModules, NativeEventEmitter } from 'react-native';
import { IThemingModuleHelper, IThemingModule, ICxxException, PlatformDefaultsChangedCallback } from './ThemingModule.types';
import { IWindowsPalette, paletteFromOfficeColors, resolvePartialTheme } from '@uifabricshared/theming-ramp';
import { getBaselinePlatformTheme } from '../platform';
import { INativeTheme } from '..';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: IThemingModule & EventSubscriptionVendor;
  }
}

class ColorRamp implements IColorRamp {
  constructor(public values: string[], median?: number) {
    this.index = median || Math.round(values.length / 2);
  }
  toString = () => {
    this.values[this.index];
  };
}

type PaletteCache = { [key: string]: Partial<IWindowsPalette> };

function isException(palette: IWindowsPalette | ICxxException): palette is ICxxException {
  return (palette as ICxxException).message !== undefined;
}

function translatePaletteFromCache(paletteCache: PaletteCache, palette?: string) {
  const key = palette || 'WhiteColors';
  if (!paletteCache[key]) {
    const paletteValue = NativeModules.Theming.getPalette(palette);
    if (isException(paletteValue)) return {};

    paletteCache[key] = paletteValue;
  }
  return paletteFromOfficeColors(paletteCache[key]);
}

function translateWindowsTheme(paletteCache: PaletteCache, palette?: string) {
  return {
    colors: {
      brand: new ColorRamp(NativeModules.Theming.ramps.App),
      neutrals: new ColorRamp(NativeModules.Theming.ramps.FluentGrays),
      warning: new ColorRamp(NativeModules.Theming.ramps.Sepias),
      neutrals2: new ColorRamp(NativeModules.Theming.ramps.ClassicGrays),
      // error: new ColorRamp()
      ...translatePaletteFromCache(paletteCache, palette)
    },
    typography: NativeModules.Theming.typography
  };
}

function makeHelper(): IThemingModuleHelper {
  const nativeEventEmitter = new NativeEventEmitter(NativeModules.Theming);
  const paletteCache: PaletteCache = {};
  return {
    getPlatformTheme: (palette?: string) => {
      return resolvePartialTheme(getBaselinePlatformTheme(), translateWindowsTheme(paletteCache, palette));
    },
    getPlatformThemeDefinition: (palette?: string) => {
      return (_parent: INativeTheme) => translatePaletteFromCache(paletteCache, palette);
    },
    getPalettes: () => Object.keys(NativeModules.Theming.palettes),
    addListener: (callback: PlatformDefaultsChangedCallback) => {
      nativeEventEmitter.addListener('onPlatformDefaultsChanged', callback);
    }
  };
}

export const ThemingModuleHelper = makeHelper();
