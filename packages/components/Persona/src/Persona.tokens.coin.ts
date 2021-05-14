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

  // There's a type mismatch here which is Windows-specific.
  //
  // The result of buildPersonaCoinRootStyle() is ViewProps, which
  // cannot be coerced to IViewWin32Props. The accessibilityActions
  // prop is where the mismatch happens. Within that object, there
  // is a name prop, and it is defined differently.
  //
  // In react-native, name is string | AccessibilityActionName.
  // On Windows, name is only AccessibilityActionName.
  //
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return buildPersonaCoinRootStyle(personaCoinTokens, theme);
}

export const buildCoinStyle = styleFunction<IViewProps, IPersonaTokens, ITheme>(_buildCoinStyle, _coinStyleKeys);
