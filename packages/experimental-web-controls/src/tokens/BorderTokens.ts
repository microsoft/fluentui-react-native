import { processTokens } from './TokenHelpers';

export interface IBorderTokens {
  borderColor?: string;
  borderWidth?: number | string;
  borderRadius?: number | string;
}

export const borderKeys: (keyof IBorderTokens)[] = ['borderColor', 'borderRadius', 'borderWidth'];

export function processBorderTokens(tokens: IBorderTokens, ...targetProps: object[]): void {
  processTokens(tokens, borderKeys, ...targetProps);
}
