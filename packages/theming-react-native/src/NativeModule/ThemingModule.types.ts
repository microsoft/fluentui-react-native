import { ITypography, ColorValue } from '@uifabricshared/theming-ramp';
import { INativeTheme, INativeThemeDefinition } from '../INativeTheme.types';
import { IOfficePalette } from './office';

export type PlatformDefaultsChangedCallback = () => void;

export interface ICxxException {
  message: string;
}

export interface INativeColorRamps {
  FluentGrays: ColorValue[];
  ClassicGrays: ColorValue[];
  App: ColorValue[];
  Sepias: ColorValue[];
  [key: string]: ColorValue[];
}

export interface IPaletteIDs {
  [key: string]: string;
}

export interface IThemingModule {
  getPalette(palette?: string): IOfficePalette | ICxxException;
  typography: ITypography;
  ramps: INativeColorRamps;
  palettes: IPaletteIDs;
}

export interface IEventEmitter {
  addListener: (event: string, PlatformDefaultsChangedCallback) => void;
}

export type IPlatformThemeDefinition = (parent: INativeTheme) => INativeThemeDefinition;

export interface IThemingModuleHelper {
  /**
   * Gets a complete platform theme suitable for using with a Theme Registry
   */
  getPlatformDefaults: (themeId?: string) => INativeTheme;
  /**
   * Gets a theme definition to register with a Theme Registry & use with the theme context to create a subtree with the
   * look & feel of a platform theme.
   */
  getPlatformThemeDefinition: (themeId?: string) => IPlatformThemeDefinition;
  getThemeIDs: () => string[];
  addListener: (listener: PlatformDefaultsChangedCallback) => void; // TODO: Should probably be able to remove
}
