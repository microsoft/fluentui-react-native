import { memoize } from '@fluentui-react-native/framework';
import { ShadowToken } from '@fluentui-react-native/theme-types';
import { ColorValue } from 'react-native';

export const getShadowTokenStyleSet = memoize(getShadowTokenStyleSetWorker);

function getShadowTokenStyleSetWorker(shadowToken: ShadowToken) {
  if (!shadowToken) {
    return {
      key: emptyShadowStyle,
      ambient: emptyShadowStyle,
    };
  }

  const keyShadow = shadowToken.key;
  const ambientShadow = shadowToken.ambient;

  return {
    key: {
      shadowColor: shadowColorFromRGBAColor(keyShadow.color),
      shadowOpacity: shadowOpacityFromRGBAColor(keyShadow.color),
      shadowRadius: keyShadow.blur,
      shadowOffset: {
        width: keyShadow.x,
        height: keyShadow.y,
      },
    },
    ambient: {
      shadowColor: shadowColorFromRGBAColor(ambientShadow.color),
      shadowOpacity: shadowOpacityFromRGBAColor(ambientShadow.color),
      shadowRadius: ambientShadow.blur,
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

const emptyShadowStyle = {
  shadowColor: '000000',
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: {
    width: 0,
    height: 0,
  },
};
