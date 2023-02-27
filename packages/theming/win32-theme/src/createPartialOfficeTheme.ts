import type { OfficePalette, PartialTheme } from '@fluentui-react-native/theme-types';

import type { OfficeThemingModule } from './NativeModule/officeThemingModule';
import { paletteFromOfficeColors } from './paletteFromOfficeColors';

type Colors = { [key: string]: string };

const getRamps = (module: OfficeThemingModule): Colors => {
  return Object.keys(module.ramps).reduce<Colors>((total: Colors, colorRamp: string) => {
    return Object.assign(
      total,
      ...module.rampNames[colorRamp].map((rampValueName: string, index: number) => {
        return { [rampValueName]: module.ramps[colorRamp][index] };
      }),
    );
  }, {});
};

/**
 * create a partial theme with overrides from the office native module
 *
 * @param module - theming native module, either the real one or a mock implementation
 * @param palette - Office palette colors, if they have been successfully retrieved
 */
export function createPartialOfficeTheme(module: OfficeThemingModule, themeName?: string, palette?: OfficePalette): PartialTheme {
  return {
    colors: {
      ...(palette && paletteFromOfficeColors(palette)),
    },
    typography: module.fluentTypography,
    host: {
      // Office Semantic Colors
      palette: palette || {},
      // Office Branding Colors
      colors: getRamps(module),
    },
    ...(themeName ? { name: themeName } : undefined),
  };
}
