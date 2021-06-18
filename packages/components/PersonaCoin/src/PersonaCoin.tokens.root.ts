import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ViewProps, ViewStyle } from 'react-native';
import { calculateEffectiveSizes } from './PersonaCoin.helpers';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

const _rootKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size', 'horizontalIconAlignment', 'verticalIconAlignment'];

function _buildRootStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ViewProps {
  const rootStyle: ViewStyle = {
    flexDirection: 'row',
  };

  const { physicalSize } = calculateEffectiveSizes(tokenProps);
  rootStyle.width = physicalSize;
  rootStyle.height = physicalSize;

  const { horizontalIconAlignment, verticalIconAlignment } = tokenProps;
  rootStyle.justifyContent = nameMap[horizontalIconAlignment || 'end'] as ViewStyle['justifyContent'];
  rootStyle.alignItems = nameMap[verticalIconAlignment || 'end'] as ViewStyle['alignItems'];

  return { style: rootStyle };
}

export const buildRootStyles = styleFunction<ViewProps, IPersonaCoinTokens, ITheme>(_buildRootStyles, _rootKeyProps);
