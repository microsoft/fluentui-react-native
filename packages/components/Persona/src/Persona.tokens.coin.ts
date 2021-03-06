import type { IViewProps } from '@fluentui-react-native/adapters';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';
import { buildRootStyles as buildPersonaCoinRootStyle, IPersonaCoinTokens } from '@fluentui-react-native/persona-coin';
import { IPersonaTokens } from './Persona.types';

const _coinStyleKeys: (keyof IPersonaTokens)[] = [
  'coinSize',
  'size',
  'horizontalIconAlignment',
  'verticalIconAlignment',
  'coinBackgroundColor',
];

function _buildCoinStyle(tokenProps: IPersonaTokens, theme: ITheme): IViewProps {
  const { coinBackgroundColor, ...rest } = tokenProps;

  const personaCoinTokens: IPersonaCoinTokens = {
    ...rest,
    backgroundColor: coinBackgroundColor,
  };

  return buildPersonaCoinRootStyle(personaCoinTokens, theme);
}

export const buildCoinStyle = styleFunction<IViewProps, IPersonaTokens, ITheme>(_buildCoinStyle, _coinStyleKeys);
