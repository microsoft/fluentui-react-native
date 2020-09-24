import { ColorValue, OfficePalette, Typography } from '@fluentui-react-native/theme-types';

export type PlatformDefaultsChangedArgs = { hostThemeName: string };
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

export interface OfficeThemingModule {
  getPalette(palette?: string): OfficePalette | CxxException;
  typography: object;
  fluentTypography: Typography;
  ramps: NativeColorRamps;
  initialHostThemeSetting?: string;
}

export interface IEventEmitter {
  addListener: (event: string, PlatformDefaultsChangedCallback) => void;
}
