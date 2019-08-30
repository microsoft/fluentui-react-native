import { ICSSStyle } from '../htmlTypes';
import { ITokenOperation } from '@uifabric/foundation-tokens';
import { ITheme } from '@uifabric/theming';

export interface ITextTokens {
  fontFamily?: ICSSStyle['fontFamily'] | string;
  fontSize?: ICSSStyle['fontSize'] | string;
  fontWeight?: ICSSStyle['fontWeight'] | string;
}

export const textTokens: ITokenOperation<ITextTokens, ITheme>[] = [
  { source: 'fontFamily', lookup: t => t.typography.families },
  { source: 'fontSize', lookup: t => t.typography.sizes },
  { source: 'fontWeight', lookup: t => t.typography.weights }
];
