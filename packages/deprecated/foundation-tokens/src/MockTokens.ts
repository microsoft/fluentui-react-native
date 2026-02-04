import type { AnimatableNumericValue, ColorValue } from 'react-native';

import type { IMockTheme } from './MockTheme';
import type { IStyleFactoryOperation, ILookupThemePart } from './Token.types';

export interface IMockTextTokens {
  fontSize?: string | number;
  fontWeight?: string | number;
}

export interface IMockForegroundColorTokens {
  color?: ColorValue;
}

export interface IMockBackgroundColorTokens {
  backgroundColor?: ColorValue;
}

export type IMockColorTokens = IMockForegroundColorTokens & IMockBackgroundColorTokens;

export interface IMockCaptionTextTokens {
  captionColor?: ColorValue;
}

export interface IMockBorderTokens {
  borderWidth?: number;
  borderRadius?: AnimatableNumericValue | string;
  borderColor?: ColorValue;
}

type ITokenParts<T> = IStyleFactoryOperation<T, IMockTheme>[];

export const standardTextTokens: ITokenParts<IMockTextTokens> = [
  { source: 'fontSize', lookup: (t) => t.textSizes },
  { source: 'fontWeight', lookup: (t) => t.textWeights },
];

const getPalette: ILookupThemePart<IMockTheme> = (t) => t.colors;
export const standardColorTokens: ITokenParts<IMockColorTokens> = [
  { source: 'backgroundColor', lookup: getPalette },
  { source: 'color', lookup: getPalette },
];

export const standardForegroundColorTokens: ITokenParts<IMockColorTokens> = [{ source: 'color', lookup: getPalette }];

export const standardBackgroundColorTokens: ITokenParts<IMockColorTokens> = [{ source: 'backgroundColor', lookup: getPalette }];

export const standardCaptionTokens: ITokenParts<IMockCaptionTextTokens> = [{ source: 'captionColor', target: 'color', lookup: getPalette }];

export const standardBorderTokens: ITokenParts<IMockBorderTokens> = [
  { source: 'borderColor', lookup: getPalette },
  { source: 'borderRadius' },
  { source: 'borderWidth' },
];
