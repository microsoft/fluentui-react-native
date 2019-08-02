import { processTokens } from './TokenHelpers';

export interface IForegroundColorTokens {
  color?: string;
}

export const foregroundColorKeys: (keyof IForegroundColorTokens)[] = ['color'];

export function processForegroundTokens(tokens: IForegroundColorTokens, ...targetProps: object[]): void {
  processTokens(tokens, foregroundColorKeys, ...targetProps);
}

export interface IBackgroundColorTokens {
  backgroundColor?: string;
}

export const backgroundColorKeys: (keyof IBackgroundColorTokens)[] = ['backgroundColor'];

export function processBackgroundTokens(tokens: IBackgroundColorTokens, ...targetProps: object[]): void {
  processTokens(tokens, backgroundColorKeys, ...targetProps);
}
