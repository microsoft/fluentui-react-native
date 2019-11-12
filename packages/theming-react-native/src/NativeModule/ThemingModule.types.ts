import { ITypography, ColorValue } from '@uifabricshared/theming-ramp';
import { INativeTheme, INativeThemeDefinition } from '../INativeTheme.types';
import { IOfficePalette } from './office';
import { IProcessTheme } from '@uifabricshared/theme-registry';

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

export interface IOfficeThemingModule {
  getPalette(palette?: string): IOfficePalette | ICxxException;
  typography: ITypography;
  ramps: INativeColorRamps;
}

export interface IEventEmitter {
  addListener: (event: string, PlatformDefaultsChangedCallback) => void;
}

export type IPlatformThemeDefinition = INativeThemeDefinition | IProcessTheme<INativeTheme, INativeThemeDefinition>;

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
  addListener: (listener: PlatformDefaultsChangedCallback) => void; // TODO: Should probably be able to remove
}
