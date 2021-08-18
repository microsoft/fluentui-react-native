import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ImageProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { Theme } from '@fluentui-react-native/framework';
import { calculateEffectiveSizes } from './PersonaCoin.helpers';

const _iconKeyProps: (keyof IPersonaCoinTokens)[] = ['iconSize', 'size', 'coinSize'];

function _buildIconStyles(tokenProps: IPersonaCoinTokens, theme: Theme): ImageProps {
  const { iconSize, iconStrokeWidth } = calculateEffectiveSizes(tokenProps);
  const iconSizeAdjusted = iconSize + iconStrokeWidth * 2;
  const iconStrokeColor = tokenProps.iconStrokeColor || theme.colors.background;

  return {
    source: {},
    style: {
      position: 'absolute',
      width: iconSizeAdjusted,
      height: iconSizeAdjusted,
      bottom: -iconStrokeWidth,
      end: -iconStrokeWidth,
      borderRadius: iconSizeAdjusted / 2,
      borderWidth: iconStrokeWidth,
      borderColor: iconStrokeColor,
    },
  };
}

export const buildIconStyles = styleFunction<ImageProps, IPersonaCoinTokens, Theme>(_buildIconStyles, _iconKeyProps);
