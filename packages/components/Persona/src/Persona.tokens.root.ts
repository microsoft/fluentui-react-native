import { ViewStyle, ViewProps } from 'react-native';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { IPersonaTokens } from './Persona.types';
import { ITheme } from '@uifabricshared/theming-ramp';

const _rootKeyProps: (keyof IPersonaTokens)[] = ['coinSize', 'size'];

function _buildRootStyle(tokenProps: IPersonaTokens): ViewProps {
  const rootStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const { coinSize } = tokenProps;
  if (coinSize && coinSize > 0) {
    rootStyle.height = coinSize;
    rootStyle.minWidth = coinSize;
  }

  return { style: rootStyle };
}

export const buildRootStyle = styleFunction<ViewProps, IPersonaTokens, ITheme>(_buildRootStyle, _rootKeyProps);
