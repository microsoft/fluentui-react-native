import { ICSSStyle } from '../htmlTypes';
import { processTokens } from './TokenHelpers';

export interface ITextTokens {
  fontFamily?: ICSSStyle['fontFamily'] | string;
  fontSize?: ICSSStyle['fontSize'] | string;
  fontWeight?: ICSSStyle['fontWeight'] | string;
}

export const textTokenKeys: (keyof ITextTokens)[] = ['fontFamily', 'fontSize', 'fontWeight'];

export function processTextTokens(tokens: ITextTokens, ...targetProps: object[]): void {
  processTokens(tokens, textTokenKeys, ...targetProps);
}
