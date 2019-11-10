import { IPartialPalette, IColorRamp, IWindowsPalette, resolvePartialTheme, paletteFromOfficeColors } from '@uifabricshared/theming-ramp';
import { IThemingModule, ICxxException, PlatformDefaultsChangedCallback, IThemingModuleHelper, IEventEmitter } from './ThemingModule.types';
import { getBaselinePlatformTheme } from '../platform';
import { INativeThemeDefinition, INativeTheme } from '../INativeTheme';

export class ColorRamp implements IColorRamp {
  constructor(public values: string[], median?: number) {
    this.index = median || (values && Math.round(values.length / 2)) || -1;
  }
  index: number;
  toString = () => {
    return this.values[this.index];
  };
}

export function translateWindowsTheme(module: IThemingModule, palette: IPartialPalette) {
  return {
    colors: {
      brand: new ColorRamp(module.ramps.App),
      neutrals: new ColorRamp(module.ramps.FluentGrays),
      warning: new ColorRamp(module.ramps.Sepias),
      neutrals2: new ColorRamp(module.ramps.ClassicGrays),
      // danger: new ColorRamp()
      ...palette
    },
    typography: module.typography
  };
}

type PaletteCache = { [key: string]: IWindowsPalette };

function isException(palette: IWindowsPalette | ICxxException): palette is ICxxException {
  return (palette as ICxxException).message !== undefined;
}

function updatePaletteInCache(module: IThemingModule, cache: PaletteCache, palette: string) {
  const paletteValue = module.getPalette(palette);
  if (!isException(paletteValue)) {
    cache[palette] = paletteValue;
  }
}

function translatePalette(module: IThemingModule, paletteCache: PaletteCache, palette?: string): IPartialPalette {
  const key = palette || 'WhiteColors';
  if (!paletteCache[key]) {
    updatePaletteInCache(module, paletteCache, key);
  }
  return paletteCache[key] ? paletteFromOfficeColors(paletteCache[key]) : {};
}

export function makeThemingModuleHelper(emitter: IEventEmitter, themingModule?: IThemingModule): IThemingModuleHelper {
  themingModule || console.error('No NativeModule for Theming found');
  const paletteCache: PaletteCache = {};
  return {
    getPlatformTheme: (palette?: string) => {
      return resolvePartialTheme(
        getBaselinePlatformTheme(),
        translateWindowsTheme(themingModule, translatePalette(themingModule, paletteCache, palette))
      );
    },
    getPlatformThemeDefinition: (palette?: string) => {
      return (_parent: INativeTheme) => {
        updatePaletteInCache(themingModule, paletteCache, palette);
        const newColors: INativeThemeDefinition['colors'] = translatePalette(themingModule, paletteCache, palette);
        return { colors: newColors };
      };
    },
    getPalettes: () => Object.keys(themingModule.palettes),
    addListener: (callback: PlatformDefaultsChangedCallback) => {
      emitter.addListener('onPlatformDefaultsChanged', callback);
    }
  };
}
