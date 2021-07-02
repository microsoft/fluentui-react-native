import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ImageProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { calculateEffectiveSizes } from './PersonaCoin.helpers';

const _photoKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size'];

function _buildPhotoStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ImageProps {
  const { physicalSize } = calculateEffectiveSizes(tokenProps);

  return {
    source: {},
    style: {
      borderRadius: physicalSize / 2,
      width: physicalSize,
      height: physicalSize,
    },
    resizeMode: 'cover',
  };
}

export const buildPhotoStyles = styleFunction<ImageProps, IPersonaCoinTokens, ITheme>(_buildPhotoStyles, _photoKeyProps);
