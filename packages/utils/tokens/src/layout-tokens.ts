import { ViewStyle } from 'react-native';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';
import { tokenBuilder } from './tokenBuilder';

export interface LayoutTokens {
  minWidth?: ViewStyle['minWidth'];
  minHeight?: ViewStyle['minHeight'];
}

export const layoutTokens: IOperationSet<LayoutTokens, ITheme> = [{ source: 'minWidth' }, { source: 'minHeight' }];

export const layoutStyles = tokenBuilder<LayoutTokens>('minWidth', 'minHeight');
