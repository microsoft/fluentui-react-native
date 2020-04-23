import { ITheme, IPartialPalette, IColorRamp, resolvePartialTheme } from '@uifabricshared/theming-ramp';
import {
  IOfficeThemingModule,
  ICxxException,
  PlatformDefaultsChangedCallback,
  IThemingModuleHelper,
  IEventEmitter,
  PlatformDefaultsChangedArgs
} from './ThemingModule.types';
import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';
import { IOfficePalette, paletteFromOfficeColors } from './office';
import { useFakePalette } from './useFakePalette';

const createColorRamp = ({ values, index = -1 }: Partial<IColorRamp>) => ({
  values,
  index,
  toString() {
    return this.values[Math.round(values.length / 2)];
  }
});

type PaletteCache = { [key: string]: IOfficePalette };

function isException(palette: IOfficePalette | ICxxException): palette is ICxxException {
  return (palette as ICxxException).message !== undefined;
}

function updatePaletteInCache(module: IOfficeThemingModule, cache: PaletteCache, palette: string) {
  const paletteValue = module.getPalette(palette);
  if (!isException(paletteValue)) {
    cache[palette] = paletteValue;
  }
}

function translatePalette(module: IOfficeThemingModule, paletteCache: PaletteCache, palette?: string): IPartialPalette {
  const key = useFakePalette ? 'debug' : palette || 'WhiteColors';
  if (!paletteCache[key]) {
    updatePaletteInCache(module, paletteCache, key);
  }
  return paletteCache[key] ? paletteFromOfficeColors(paletteCache[key]) : {};
}

export function translateOfficeTheme(module: IOfficeThemingModule, cache: PaletteCache, id?: string) {
  const palette = translatePalette(module, cache, id);
  return {
    colors: {
      brand: createColorRamp({ values: module.ramps.App }),
      neutrals: createColorRamp({ values: module.ramps.FluentGrays }),
      warning: createColorRamp({ values: module.ramps.Sepias }),
      neutrals2: createColorRamp({ values: module.ramps.ClassicGrays }),
      ...palette
    },
    typography: module.fluentTypography || {},
    host: {
      palette: cache[id]
    }
  };
}

export function createThemingModuleHelper(themingModule?: IOfficeThemingModule, emitter?: IEventEmitter): IThemingModuleHelper {
  themingModule || console.error('No NativeModule for Theming found');
  const paletteCache: PaletteCache = {};
  let _hostTheme = themingModule.initialHostThemeSetting || '';
  emitter &&
    emitter.addListener('onPlatformDefaultsChanged', (args: PlatformDefaultsChangedArgs) => {
      _hostTheme = (args && args.hostThemeSetting) || _hostTheme;
      Object.keys(paletteCache).forEach((key: string) => delete paletteCache[key]);
    });
  return {
    getPlatformDefaults: (themeId?: string) => {
      return resolvePartialTheme(
        getBaselinePlatformTheme(),
        Object.assign(translateOfficeTheme(themingModule, paletteCache, themeId), { name: _hostTheme })
      );
    },
    getPlatformThemeDefinition: (themeId?: string) => {
      return (_parent: ITheme) => {
        updatePaletteInCache(themingModule, paletteCache, themeId);
        return translateOfficeTheme(themingModule, paletteCache, themeId);
      };
    },
    addListener: (callback: PlatformDefaultsChangedCallback) => {
      emitter && emitter.addListener('onPlatformDefaultsChanged', callback);
    }
  };
}
