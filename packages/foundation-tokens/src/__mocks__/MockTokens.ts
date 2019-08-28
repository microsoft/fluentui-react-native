import { defineTokenProcessor } from '../Token.function';
import { ILookupThemePart } from '../Token.function.types';
import { IMockTheme } from './MockTheme';

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

export const processTextTokens = defineTokenProcessor<IMockTextTokens, IMockTheme>([
  { key: 'fontSize', lookup: t => t.textSizes },
  { key: 'fontWeight', lookup: t => t.textWeights }
]);

const getPalette: ILookupThemePart<IMockTheme> = t => t.colors;
export const processColorTokens = defineTokenProcessor<IMockColorTokens, IMockTheme>([
  { key: 'backgroundColor', lookup: getPalette },
  { key: 'color', lookup: getPalette }
]);

export const processForegroundColorTokens = defineTokenProcessor<IMockColorTokens, IMockTheme>([{ key: 'color', lookup: getPalette }]);

export const processBackgroundColorTokens = defineTokenProcessor<IMockColorTokens, IMockTheme>([
  { key: 'backgroundColor', lookup: getPalette }
]);

export const processCaptionTokens = defineTokenProcessor<IMockCaptionTextTokens, IMockTheme>([
  { key: 'captionColor', target: 'color', lookup: getPalette }
]);

export const processBorderTokens = defineTokenProcessor<IMockBorderTokens, IMockTheme>([
  { key: 'borderColor', lookup: getPalette },
  { key: 'borderRadius' },
  { key: 'borderWidth' }
]);
