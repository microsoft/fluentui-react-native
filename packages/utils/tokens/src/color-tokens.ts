import { Theme, ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { OperationSet } from './token.types';
import { ColorValue } from 'react-native';

export interface IForegroundColorTokens {
  color?: ColorValue;
}

export const getPaletteFromTheme = (theme: Theme): ThemeColorDefinition => {
  return theme.colors;
};

export const foregroundColorTokens: OperationSet<IForegroundColorTokens, Theme> = [{ source: 'color', lookup: getPaletteFromTheme }];

export interface IBackgroundColorTokens {
  backgroundColor?: ColorValue;
}

export const backgroundColorTokens: OperationSet<IBackgroundColorTokens, Theme> = [
  { source: 'backgroundColor', lookup: getPaletteFromTheme },
];

export type IColorTokens = IForegroundColorTokens & IBackgroundColorTokens;
export const colorTokens = [...foregroundColorTokens, ...backgroundColorTokens];
