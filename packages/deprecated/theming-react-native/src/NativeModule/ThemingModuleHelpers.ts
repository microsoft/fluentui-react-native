import { ITheme, resolvePartialTheme, OfficePalette } from '@uifabricshared/theming-ramp';
import { IThemingModuleHelper, IEventEmitter } from './ThemingModule.types';
import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';
import {
  OfficeThemingModule,
  createPartialOfficeTheme,
  CxxException,
  PlatformDefaultsChangedCallback,
  PlatformDefaultsChangedArgs,
} from '@fluentui-react-native/win32-theme';

type PaletteCache = { [key: string]: OfficePalette };

function isException(palette: OfficePalette | CxxException): palette is CxxException {
  return (palette as CxxException).message !== undefined;
}

function updatePaletteInCache(module: OfficeThemingModule, cache: PaletteCache, palette: string) {
  const paletteValue = module.getPalette(palette);
  if (!isException(paletteValue)) {
    cache[palette] = paletteValue;
  }
}

const getPaletteCacheKey = (palette?: string) => {
  return palette || 'WhiteColors';
};

function ensurePalette(module: OfficeThemingModule, paletteCache: PaletteCache, palette?: string): OfficePalette {
  const key = getPaletteCacheKey(palette);
  if (!paletteCache[key]) {
    updatePaletteInCache(module, paletteCache, key);
  }
  return paletteCache[key] || ({} as OfficePalette);
}

export function translateOfficeTheme(module: OfficeThemingModule, cache: PaletteCache, id?: string, themeName?: string) {
  const palette = ensurePalette(module, cache, id);
  return createPartialOfficeTheme(module, themeName, palette);
}

export function createThemingModuleHelper(themingModule?: OfficeThemingModule, emitter?: IEventEmitter): IThemingModuleHelper {
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
      return resolvePartialTheme(getBaselinePlatformTheme(), translateOfficeTheme(themingModule, paletteCache, themeId, _hostTheme));
    },
    getPlatformThemeDefinition: (themeId?: string) => {
      return (_parent: ITheme) => {
        updatePaletteInCache(themingModule, paletteCache, themeId);
        return translateOfficeTheme(themingModule, paletteCache, themeId);
      };
    },
    addListener: (callback: PlatformDefaultsChangedCallback) => {
      emitter && emitter.addListener('onPlatformDefaultsChanged', callback);
    },
  };
}
