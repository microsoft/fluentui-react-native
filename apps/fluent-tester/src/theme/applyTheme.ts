import type { PartialTheme, ThemeOptions } from '@fluentui-react-native/framework';
import { createOfficeTheme, getThemingModule } from '@fluentui-react-native/win32-theme';

export type ThemeNames = 'Default' | 'Office' | 'Apple';

export const themeChoices = [
  { label: 'Default', value: 'Default' },
  { label: 'Office', value: 'Office' },
];

const themingModule = getThemingModule()[0];

/** apply the currently active theme layering */
export function applyTheme(name: ThemeNames, appearance: ThemeOptions['appearance']): PartialTheme {
  switch (name) {
    case 'Office':
      return themingModule ? createOfficeTheme({ appearance, paletteName: 'Dialogs_FluentSV' }).theme : {};
    default:
      return {};
  }
}
