import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ImageProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { calculateEffectiveSizes } from './PersonaCoin.helpers';

const _iconKeyProps: (keyof IPersonaCoinTokens)[] = ['iconSize', 'size', 'coinSize'];

function _buildIconStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ImageProps {
  const { iconSize } = calculateEffectiveSizes(tokenProps);

  return {
    source: {},
    style: {
      position: 'absolute',
      width: iconSize,
      height: iconSize
    }
  };
}

export const buildIconStyles = styleFunction<ImageProps, IPersonaCoinTokens, ITheme>(_buildIconStyles, _iconKeyProps);
