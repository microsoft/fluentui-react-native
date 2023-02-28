import type { ColorValue } from 'react-native';
import { Platform } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import type { ShadowToken } from '@fluentui-react-native/theme-types';

/**
 * For iOS/macOS, the blur property from the token is not the same as the shadow radius value,
 * it needs to be divided by 2 to achieve the same effect.
 *
 * See https://github.com/microsoft/apple-ux-guide/blob/gh-pages/Shadows.md
 */
const appleShadowBlurAdjustment = 0.5;
const defaultShadowBlurAdjustment = 1;

export const getShadowTokenStyleSet = memoize(getShadowTokenStyleSetWorker);

function getShadowTokenStyleSetWorker(shadowToken: ShadowToken) {
  const keyShadow = shadowToken.key;
  const ambientShadow = shadowToken.ambient;
  const shadowBlurAdjustment = Platform.OS === 'macos' || Platform.OS === 'ios' ? appleShadowBlurAdjustment : defaultShadowBlurAdjustment;

  return {
    key: {
      shadowColor: shadowColorFromRGBAColor(keyShadow.color),
      shadowOpacity: shadowOpacityFromRGBAColor(keyShadow.color),
      shadowRadius: keyShadow.blur * shadowBlurAdjustment,
      shadowOffset: {
        width: keyShadow.x,
        height: keyShadow.y,
      },
    },
    ambient: {
      shadowColor: shadowColorFromRGBAColor(ambientShadow.color),
      shadowOpacity: shadowOpacityFromRGBAColor(ambientShadow.color),
      shadowRadius: ambientShadow.blur * shadowBlurAdjustment,
      shadowOffset: {
        width: ambientShadow.x,
        height: ambientShadow.y,
      },
    },
  };
}

const shadowColorFromRGBAColor = (rgbaColor: ColorValue) => {
  return rgbaColor.toString().substring(0, 7);
};

const shadowOpacityFromRGBAColor = (rgbaColor: ColorValue) => {
  const opacityAsHex = '0x' + rgbaColor.toString().substring(7);
  const opacityAsDecimal = Number(opacityAsHex) / 255.0;

  // Round to two decimal places
  return Math.round(opacityAsDecimal * 100) / 100;
};
