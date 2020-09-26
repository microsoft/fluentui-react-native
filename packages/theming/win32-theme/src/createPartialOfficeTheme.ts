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

type Colors = { [key: string]: string };

const getRamps = (module: OfficeThemingModule): Colors => {
  return Object.keys(module.ramps).reduce<Colors>((total: Colors, colorRamp: string) => {
    return Object.assign(total, ...module.rampNames[colorRamp].map((rampValueName: string, index: number) => {
      return { [rampValueName]: module.ramps[colorRamp][index] };
    }));
  }, {});
}

/**
 * create a partial theme with overrides from the office native module
 *
 * @param module - theming native module, either the real one or a mock implementation
 * @param palette - Office palette colors, if they have been sucessfully retrieved
 */
export function createPartialOfficeTheme(module: OfficeThemingModule, themeName?: string, palette?: OfficePalette): PartialTheme {
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
      // Office Semantic Colors
      palette: palette || {},
      // Office Branding Colors
      colors: getRamps(module),
    },
    ...(themeName && { name: themeName }),
  };
}
