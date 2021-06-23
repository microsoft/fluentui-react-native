import { ViewStyle, ViewProps } from 'react-native';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { IPersonaTokens } from './Persona.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { getHorizontalGap } from './Persona.helpers';

const _stackKeyProps: (keyof IPersonaTokens)[] = ['size', 'horizontalGap'];

function _buildStackStyle(tokenProps: IPersonaTokens): ViewProps {
  const { size, horizontalGap } = tokenProps;

  const stackStyle: ViewStyle = {
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingLeft: horizontalGap || getHorizontalGap(size),
  };

  return { style: stackStyle };
}

export const buildStackStyle = styleFunction<ViewProps, IPersonaTokens, ITheme>(_buildStackStyle, _stackKeyProps);
