import { IWindowsPalette, ITypography, ColorValue } from '@uifabricshared/theming-ramp';
import { INativeTheme, INativeThemeDefinition } from '..';

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
  getPalette(palette?: string): IWindowsPalette | ICxxException;
  typography: ITypography;
  ramps: INativeColorRamps;
  palettes: IPaletteIDs;
}

export interface IEventEmitter {
  addListener: (event: string, PlatformDefaultsChangedCallback) => void;
}

export type IPlatformThemeDefinition = (parent: INativeTheme) => INativeThemeDefinition;

export interface IThemingModuleHelper {
  getPlatformTheme: (palette?: string) => INativeTheme;
  getPlatformThemeDefinition: (palette?: string) => IPlatformThemeDefinition;
  getPalettes: () => string[];
  addListener: (listener: PlatformDefaultsChangedCallback) => void; // TODO: Should probably be able to remove
}
