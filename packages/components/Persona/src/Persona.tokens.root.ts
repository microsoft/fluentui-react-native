import { ViewStyle } from 'react-native';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { IPersonaTokens } from './Persona.types';
import { Theme } from '@fluentui-react-native/framework';
import type { IViewProps } from '@fluentui-react-native/adapters';

const _rootKeyProps: (keyof IPersonaTokens)[] = ['coinSize', 'size'];

function _buildRootStyle(tokenProps: IPersonaTokens): IViewProps {
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

export const buildRootStyle = styleFunction<IViewProps, IPersonaTokens, Theme>(_buildRootStyle, _rootKeyProps);
