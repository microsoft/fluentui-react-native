import type { IViewProps } from '@fluentui-react-native/adapters';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { Theme } from '@fluentui-react-native/framework';
import { buildRootStyles as buildPersonaCoinRootStyle, IPersonaCoinTokens } from '@fluentui-react-native/persona-coin';
import { IPersonaTokens } from './Persona.types';

const _coinStyleKeys: (keyof IPersonaTokens)[] = [
  'coinSize',
  'size',
  'horizontalIconAlignment',
  'verticalIconAlignment',
  'coinBackgroundColor',
];

function _buildCoinStyle(tokenProps: IPersonaTokens, theme: Theme): IViewProps {
  const { coinBackgroundColor, ...rest } = tokenProps;

  const personaCoinTokens: IPersonaCoinTokens = {
    ...rest,
    backgroundColor: coinBackgroundColor,
  };

  return buildPersonaCoinRootStyle(personaCoinTokens, theme);
}

export const buildCoinStyle = styleFunction<IViewProps, IPersonaTokens, Theme>(_buildCoinStyle, _coinStyleKeys);
