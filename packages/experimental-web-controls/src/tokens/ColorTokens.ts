import { ITheme } from '@uifabricshared/theming-ramp';
import { IOperationSet } from '@uifabricshared/foundation-tokens';

export interface IForegroundColorTokens {
  color?: string;
}

export const getPaletteFromTheme = (theme: ITheme) => {
  return theme.colors;
};

export const foregroundColorTokens: IOperationSet<IForegroundColorTokens, ITheme> = [{ source: 'color', lookup: getPaletteFromTheme }];

export interface IBackgroundColorTokens {
  backgroundColor?: string;
}

export const backgroundColorTokens: IOperationSet<IBackgroundColorTokens, ITheme> = [
  { source: 'backgroundColor', lookup: getPaletteFromTheme }
];

export type IColorTokens = IForegroundColorTokens & IBackgroundColorTokens;
export const colorTokens = [...foregroundColorTokens, ...backgroundColorTokens];
