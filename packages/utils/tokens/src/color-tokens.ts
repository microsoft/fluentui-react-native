import { ITheme, IThemeColorDefinition } from '@uifabricshared/theming-ramp';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ColorValue } from '@fluentui-react-native/theme-types';

export interface IForegroundColorTokens {
  color?: ColorValue;
}

export const getPaletteFromTheme = (theme: ITheme): IThemeColorDefinition => {
  return theme.colors;
};

export const foregroundColorTokens: IOperationSet<IForegroundColorTokens, ITheme> = [{ source: 'color', lookup: getPaletteFromTheme }];

export interface IBackgroundColorTokens {
  backgroundColor?: ColorValue;
}

export const backgroundColorTokens: IOperationSet<IBackgroundColorTokens, ITheme> = [
  { source: 'backgroundColor', lookup: getPaletteFromTheme },
];

export type IColorTokens = IForegroundColorTokens & IBackgroundColorTokens;
export const colorTokens = [...foregroundColorTokens, ...backgroundColorTokens];
