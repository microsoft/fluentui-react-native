import { ViewProps } from 'react-native';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';
import { buildRootStyles as buildPersonaCoinRootStyle } from '../PersonaCoin/PersonaCoin.tokens.root';
import { IPersonaTokens } from './Persona.types';
import { IPersonaCoinTokens } from '../PersonaCoin/PersonaCoin.types';

const _coinStyleKeys: (keyof IPersonaTokens)[] = [
  'coinSize',
  'size',
  'horizontalIconAlignment',
  'verticalIconAlignment',
  'coinBackgroundColor'
];

function _buildCoinStyle(tokenProps: IPersonaTokens, theme: ITheme): ViewProps {
  const { coinBackgroundColor, ...rest } = tokenProps;

  const personaCoinTokens: IPersonaCoinTokens = {
    ...rest,
    backgroundColor: coinBackgroundColor
  };

  return buildPersonaCoinRootStyle(personaCoinTokens, theme);
}

export const buildCoinStyle = styleFunction<ViewProps, IPersonaTokens, ITheme>(_buildCoinStyle, _coinStyleKeys);
