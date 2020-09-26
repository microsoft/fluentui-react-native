import { OfficePalette, PartialTheme } from '@fluentui-react-native/theme-types';
import { OfficeThemingModule } from './NativeModule/officeThemingModule';
import { paletteFromOfficeColors } from './paletteFromOfficeColors';


/**
 * create a partial theme with overrides from the office native module
 *
 * @param module - theming native module, either the real one or a mock implementation
 * @param palette - Office palette colors, if they have been sucessfully retrieved
 */
export function createPartialOfficeTheme(module: OfficeThemingModule, themeName?: string, palette?: OfficePalette): PartialTheme {
  return {
    colors: {
      ...(palette && paletteFromOfficeColors(palette)),
    },
    typography: module.fluentTypography,
    host: {
      palette: palette || {},
    },
    ...(themeName && { name: themeName }),
  };
}
