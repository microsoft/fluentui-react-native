import { ViewStyle } from 'react-native';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { Theme } from '@fluentui-react-native/theme-types';
import { tokenBuilder } from './tokenBuilder';

export interface LayoutTokens {
  minWidth?: ViewStyle['minWidth'];
  minHeight?: ViewStyle['minHeight'];
}

export const layoutTokens: IOperationSet<LayoutTokens, Theme> = [{ source: 'minWidth' }, { source: 'minHeight' }];

export const layoutStyles = tokenBuilder<LayoutTokens>('minWidth', 'minHeight');
