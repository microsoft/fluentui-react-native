import { ViewStyle } from 'react-native';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { IPersonaTokens } from './Persona.types';
import { Theme } from '@fluentui-react-native/framework';
import { getHorizontalGap } from './Persona.helpers';
import type { IViewProps } from '@fluentui-react-native/adapters';

const _stackKeyProps: (keyof IPersonaTokens)[] = ['size', 'horizontalGap'];

function _buildStackStyle(tokenProps: IPersonaTokens): IViewProps {
  const { size, horizontalGap } = tokenProps;

  const stackStyle: ViewStyle = {
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingLeft: horizontalGap || getHorizontalGap(size),
  };

  return { style: stackStyle };
}

export const buildStackStyle = styleFunction<IViewProps, IPersonaTokens, Theme>(_buildStackStyle, _stackKeyProps);
