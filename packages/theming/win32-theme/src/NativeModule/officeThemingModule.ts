import type { NativeModule, ColorValue } from 'react-native';

import type { OfficePalette, ThemeColorScheme, Typography } from '@fluentui-react-native/design/theming';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

export type PlatformDefaultsChangedArgs = {
  hostThemeSetting: string;
  colorScheme?: ThemeColorScheme;
  isHighContrast?: boolean;
};
export type PlatformDefaultsChangedCallback = (args?: PlatformDefaultsChangedArgs) => void;

export interface CxxException {
  message: string;
}

export interface NativeColorRamps {
  FluentGrays: ColorValue[];
  ClassicGrays: ColorValue[];
  App: ColorValue[];
  Sepias: ColorValue[];
  [key: string]: ColorValue[];
}

export interface NativeColorNames {
  FluentGrays: string[];
  ClassicGrays: string[];
  App: string[];
  Sepias: string[];
}

export interface OfficeThemingConstants {
  typography: ObjectBase;
  fluentTypography: Typography;
  ramps: NativeColorRamps;
  rampNames: NativeColorNames;
  initialHostThemeSetting?: string;
  initialColorScheme?: ThemeColorScheme;
  initialIsHighContrast?: boolean;
}

export interface OfficeThemingModule extends NativeModule {
  getPalette(palette?: string): OfficePalette | CxxException;
  getConstants(): OfficeThemingConstants;
}

export interface IEventEmitter {
  addListener: (event: string, PlatformDefaultsChangedCallback) => void;
}
