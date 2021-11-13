import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ViewStyle } from 'react-native';
import { calculateEffectiveSizes } from './PersonaCoin.helpers';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { Theme } from '@fluentui-react-native/framework';
import type { IViewProps } from '@fluentui-react-native/adapters';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

const _rootKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size', 'horizontalIconAlignment', 'verticalIconAlignment'];

function _buildRootStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): IViewProps {
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

export const buildRootStyles = styleFunction<IViewProps, IPersonaCoinTokens, Theme>(_buildRootStyles, _rootKeyProps);
