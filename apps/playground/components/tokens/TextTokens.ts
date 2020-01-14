import { TextStyle } from 'react-native';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';

export interface ITextTokens {
  fontFamily?: TextStyle['fontFamily'] | string;
  fontSize?: TextStyle['fontSize'] | string;
  fontWeight?: TextStyle['fontWeight'] | string;
}

export const textTokens: IOperationSet<ITextTokens, ITheme> = [
  { source: 'fontFamily', lookup: (t: ITheme) => t.typography.families },
  { source: 'fontSize', lookup: (t: ITheme) => t.typography.sizes },
  { source: 'fontWeight', lookup: (t: ITheme) => t.typography.weights }
];
