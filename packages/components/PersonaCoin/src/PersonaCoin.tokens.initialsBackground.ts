import type { ViewProps } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import { styleFunction } from '@uifabricshared/foundation-tokens';

import { convertCoinColor, convertCoinColorFluent, calculateEffectiveSizes } from './PersonaCoin.helpers';
import type { IPersonaCoinTokens } from './PersonaCoin.types';

const _initialsBackgroundKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size', 'coinColor', 'coinColorFluent', 'backgroundColor'];

function _buildInitialsBackgroundStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme*/): ViewProps {
  const { physicalSize } = calculateEffectiveSizes(tokenProps);

  const { backgroundColor, coinColor, coinColorFluent } = tokenProps;
  let effectiveBackgroundColor = backgroundColor;
  if (coinColorFluent) {
    effectiveBackgroundColor = convertCoinColorFluent(coinColorFluent);
  } else if (coinColor) {
    effectiveBackgroundColor = convertCoinColor(coinColor);
  }

  return {
    style: {
      borderRadius: physicalSize / 2,
      width: physicalSize,
      height: physicalSize,
      flexGrow: 1,
      alignSelf: 'stretch',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: effectiveBackgroundColor,
    },
  };
}

export const buildInitialsBackgroundStyles = styleFunction<ViewProps, IPersonaCoinTokens, Theme>(
  _buildInitialsBackgroundStyles,
  _initialsBackgroundKeyProps,
);
