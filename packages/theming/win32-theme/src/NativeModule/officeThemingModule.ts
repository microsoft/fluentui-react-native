import type { NativeModule, ColorValue } from 'react-native';
import { OfficePalette, Typography } from '@fluentui-react-native/theme-types';

export type PlatformDefaultsChangedArgs = { hostThemeSetting: string };
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

export interface OfficeThemingModule extends NativeModule {
  getPalette(palette?: string): OfficePalette | CxxException;
  typography: object; // eslint-disable-line @typescript-eslint/ban-types
  fluentTypography: Typography;
  ramps: NativeColorRamps;
  rampNames: NativeColorNames;
  initialHostThemeSetting?: string;
}

export interface IEventEmitter {
  addListener: (event: string, PlatformDefaultsChangedCallback) => void;
}
