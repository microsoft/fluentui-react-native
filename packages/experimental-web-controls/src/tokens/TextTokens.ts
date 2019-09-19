import { ICSSStyle } from '../htmlTypes';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';

export interface ITextTokens {
  fontFamily?: ICSSStyle['fontFamily'] | string;
  fontSize?: ICSSStyle['fontSize'] | string;
  fontWeight?: ICSSStyle['fontWeight'] | string;
}

export const textTokens: IOperationSet<ITextTokens, ITheme> = [
  { source: 'fontFamily', lookup: t => t.typography.families },
  { source: 'fontSize', lookup: t => t.typography.sizes },
  { source: 'fontWeight', lookup: t => t.typography.weights }
];
