import { createDefaultTheme, ThemeOptions } from '@fluentui-react-native/default-theme';
import { ThemeReference } from '@fluentui-react-native/theme';
import { applyBrand } from './applyBrand';
import { applyTheme } from './applyTheme';

function createFluentTheme(options?: ThemeOptions): ThemeReference {
  return createDefaultTheme(options);
}

const themeOptions: ThemeOptions = { paletteName: 'TaskPane', appearance: 'dynamic' };
const fluentTheme = createFluentTheme(themeOptions);

export function updateThemeAppearance(appearance: ThemeOptions['appearance']) {
  themeOptions.appearance = appearance;
  fluentTheme.invalidate();
}

export function getLightness(): ThemeOptions['appearance'] {
  return themeOptions.appearance;
}

export const lightnessOptions = [
  { label: 'Auto', value: 'dynamic' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export const testerTheme = new ThemeReference(fluentTheme, applyTheme, applyBrand);
