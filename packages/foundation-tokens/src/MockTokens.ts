import { IMockTheme } from './MockTheme';
import { ITokenKeyLogic, ILookupThemePart } from './Token.types';

export interface IMockTextTokens {
  fontSize?: string | number;
  fontWeight?: string | number;
}

export interface IMockForegroundColorTokens {
  color?: string;
}

export interface IMockBackgroundColorTokens {
  backgroundColor?: string;
}

export type IMockColorTokens = IMockForegroundColorTokens & IMockBackgroundColorTokens;

export interface IMockCaptionTextTokens {
  captionColor?: string;
}

export interface IMockBorderTokens {
  borderWidth?: number;
  borderRadius?: number;
  borderColor?: string;
}

type ITokenParts<T> = ITokenKeyLogic<T, IMockTheme>[];

export const standardTextTokens: ITokenParts<IMockTextTokens> = [
  { key: 'fontSize', lookup: t => t.textSizes },
  { key: 'fontWeight', lookup: t => t.textWeights }
];

const getPalette: ILookupThemePart<IMockTheme> = t => t.colors;
export const standardColorTokens: ITokenParts<IMockColorTokens> = [
  { key: 'backgroundColor', lookup: getPalette },
  { key: 'color', lookup: getPalette }
];

export const standardForegroundColorTokens: ITokenParts<IMockColorTokens> = [{ key: 'color', lookup: getPalette }];

export const standardBackgroundColorTokens: ITokenParts<IMockColorTokens> = [{ key: 'backgroundColor', lookup: getPalette }];

export const standardCaptionTokens: ITokenParts<IMockCaptionTextTokens> = [{ key: 'captionColor', target: 'color', lookup: getPalette }];

export const standardBorderTokens: ITokenParts<IMockBorderTokens> = [
  { key: 'borderColor', lookup: getPalette },
  { key: 'borderRadius' },
  { key: 'borderWidth' }
];
