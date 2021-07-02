import { styleFunction } from '@uifabricshared/foundation-tokens';
import { TextProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { calculateEffectiveSizes } from './PersonaCoin.helpers';

const _initialsKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'initialsSize', 'size'];

function _buildInitialsStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): TextProps {
  const { initialsSize } = calculateEffectiveSizes(tokenProps);

  return {
    style: {
      fontSize: initialsSize,
    },
  };
}

export const buildInitialsStyles = styleFunction<TextProps, IPersonaCoinTokens, ITheme>(_buildInitialsStyles, _initialsKeyProps);
