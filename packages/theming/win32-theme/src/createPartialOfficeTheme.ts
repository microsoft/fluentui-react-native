import { ColorRamp, OfficePalette, PartialTheme } from '@fluentui-react-native/theme-types';
import { OfficeThemingModule } from './NativeModule/officeThemingModule';
import { paletteFromOfficeColors } from './paletteFromOfficeColors';

const createColorRamp = ({ values, index = -1 }: Partial<ColorRamp>) => ({
  values,
  index,
  toString() {
    return this.values[Math.round(values.length / 2)];
  },
});

/**
 * create a partial theme with overrides from the office native module
 *
 * @param module - theming native module, either the real one or a mock implementation
 * @param palette - Office palette colors, if they have been sucessfully retrieved
 */
export function createPartialOfficeTheme(module: OfficeThemingModule, palette?: OfficePalette): PartialTheme {
  return {
    colors: {
      brand: createColorRamp({ values: module.ramps.App }),
      neutral: createColorRamp({ values: module.ramps.FluentGrays }),
      ...{ neutrals2: createColorRamp({ values: module.ramps.ClassicGrays }) },
      warning: createColorRamp({ values: module.ramps.Sepias }),
      ...(palette && paletteFromOfficeColors(palette)),
    },
    typography: module.fluentTypography,
    host: {
      palette: palette || {},
    },
  };
}
