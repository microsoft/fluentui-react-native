import { ITheme, IPartialPalette, IColorRamp, resolvePartialTheme } from '@uifabricshared/theming-ramp';
import {
  IOfficeThemingModule,
  ICxxException,
  PlatformDefaultsChangedCallback,
  IThemingModuleHelper,
  IEventEmitter
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
    typography: {
      ...module.typography,
      variants: {
        smallStandard: {
          face: module.typography.families.primary,
          size: module.typography.sizes.small,
          weight: module.typography.weights.medium
        },
        mediumStandard: {
          face: module.typography.families.primary,
          size: module.typography.sizes.medium,
          weight: module.typography.weights.medium
        },
        mediumSemibold: {
          face: module.typography.families.primary,
          size: module.typography.sizes.medium,
          weight: module.typography.weights.semiBold
        },
        largeStandard: {
          face: module.typography.families.primary,
          size: module.typography.sizes.large,
          weight: module.typography.weights.medium
        },
        largeSemibold: {
          face: module.typography.families.primary,
          size: module.typography.sizes.large,
          weight: module.typography.weights.semiBold
        },
        extraLargeStandard: {
          face: module.typography.families.primary,
          size: module.typography.sizes.xLarge,
          weight: module.typography.weights.medium
        },
        extraLargeSemibold: {
          face: module.typography.families.primary,
          size: module.typography.sizes.xLarge,
          weight: module.typography.weights.semiBold
        },
        extraLargeBold: {
          face: module.typography.families.primary,
          size: module.typography.sizes.xLarge,
          weight: module.typography.weights.bold
        },
        hugeStandard: {
          face: module.typography.families.primary,
          size: module.typography.sizes.xxLarge,
          weight: module.typography.weights.medium
        },
        hugeSemibold: {
          face: module.typography.families.primary,
          size: module.typography.sizes.xxLarge,
          weight: module.typography.weights.semiBold
        },
        hugeBold: {
          face: module.typography.families.primary,
          size: module.typography.sizes.xxLarge,
          weight: module.typography.weights.bold
        },
        giantStandard: {
          face: module.typography.families.primary,
          size: module.typography.sizes.xxxLarge,
          weight: module.typography.weights.medium
        },
        giantSemibold: {
          face: module.typography.families.primary,
          size: module.typography.sizes.xxxLarge,
          weight: module.typography.weights.semiBold
        }
      }
    },
    host: {
      palette: cache[id]
    }
  };
}

export function createThemingModuleHelper(themingModule?: IOfficeThemingModule, emitter?: IEventEmitter): IThemingModuleHelper {
  themingModule || console.error('No NativeModule for Theming found');
  const paletteCache: PaletteCache = {};
  emitter &&
    emitter.addListener('onPlatformDefaultsChanged', () => {
      Object.keys(paletteCache).forEach((key: string) => delete paletteCache[key]);
    });
  return {
    getPlatformDefaults: (themeId?: string) => {
      return resolvePartialTheme(getBaselinePlatformTheme(), translateOfficeTheme(themingModule, paletteCache, themeId));
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
