import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ViewStyle, ViewProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ITheme } from '@uifabricshared/theming-ramp';

const _keyProps: (keyof IPersonaCoinTokens)[] = [
  'backgroundColor',
  'coinSize',
  'color',
  'horizontalIconAlignment',
  'iconSize',
  'iconSource',
  'initialsFontSize',
  'verticalIconAlignment'
];

function _buildRootStyles(/* tokenProps: IPersonaCoinTokens, theme: ITheme */): ViewProps {
  const rootStyle: ViewStyle = {};

  return { style: rootStyle };
}

export const buildPersonaCoinRootStyles = styleFunction<ViewProps, IPersonaCoinTokens, ITheme>(_buildRootStyles, _keyProps);
