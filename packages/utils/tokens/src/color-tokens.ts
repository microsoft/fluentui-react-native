import { ITheme, IThemeColorDefinition } from '@uifabricshared/theming-ramp';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { BackgroundColorTokenSet, ForegroundColorTokenSet } from '@fluentui-react-native/theme-types';

export type IForegroundColorTokens = ForegroundColorTokenSet;

export const getPaletteFromTheme = (theme: ITheme): IThemeColorDefinition => {
  return theme.colors;
};

export const foregroundColorTokens: IOperationSet<IForegroundColorTokens, ITheme> = [{ source: 'color', lookup: getPaletteFromTheme }];

export type IBackgroundColorTokens = BackgroundColorTokenSet;

export const backgroundColorTokens: IOperationSet<IBackgroundColorTokens, ITheme> = [
  { source: 'backgroundColor', lookup: getPaletteFromTheme },
];

export type IColorTokens = IForegroundColorTokens & IBackgroundColorTokens;
export const colorTokens = [...foregroundColorTokens, ...backgroundColorTokens];
