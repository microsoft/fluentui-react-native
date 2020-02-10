import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ViewStyle, ViewProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ITheme } from '@uifabricshared/theming-ramp';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end'
};

const _keyProps: (keyof IPersonaCoinTokens)[] = [
  'backgroundColor',
  'coinSize',
  'color',
  'iconSize',
  'initialsFontSize',
  'horizontalIconAlignment',
  'verticalIconAlignment'
];

function _buildRootStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ViewProps {
  const rootStyle: ViewStyle = {
    flexDirection: 'row'
  };

  const { coinSize, horizontalIconAlignment, verticalIconAlignment } = tokenProps;

  if (coinSize) {
    rootStyle.width = coinSize;
    rootStyle.height = coinSize;
  }

  rootStyle.justifyContent = nameMap[horizontalIconAlignment || 'end'] as ViewStyle['justifyContent'];
  rootStyle.alignItems = nameMap[verticalIconAlignment || 'end'] as ViewStyle['alignItems'];

  return { style: rootStyle };
}

export const buildPersonaCoinRootStyles = styleFunction<ViewProps, IPersonaCoinTokens, ITheme>(_buildRootStyles, _keyProps);
