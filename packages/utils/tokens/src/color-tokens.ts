import { Theme, ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ColorValue } from 'react-native';

export interface IForegroundColorTokens {
  color?: ColorValue;
}

export const getPaletteFromTheme = (theme: Theme): ThemeColorDefinition => {
  return theme.colors;
};

export const foregroundColorTokens: IOperationSet<IForegroundColorTokens, Theme> = [{ source: 'color', lookup: getPaletteFromTheme }];

export interface IBackgroundColorTokens {
  backgroundColor?: ColorValue;
}

export const backgroundColorTokens: IOperationSet<IBackgroundColorTokens, Theme> = [
  { source: 'backgroundColor', lookup: getPaletteFromTheme },
];

export type IColorTokens = IForegroundColorTokens & IBackgroundColorTokens;
export const colorTokens = [...foregroundColorTokens, ...backgroundColorTokens];
