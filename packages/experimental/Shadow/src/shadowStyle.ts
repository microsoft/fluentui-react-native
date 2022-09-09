import { memoize } from '@fluentui-react-native/framework';
import { ShadowToken } from '@fluentui-react-native/theme-types';
import { ColorValue } from 'react-native';

export const getShadowTokenStyleSet = memoize(getShadowTokenStyleSetWorker);

function getShadowTokenStyleSetWorker(shadowToken: ShadowToken) {
  const keyShadow = shadowToken.key;
  const ambientShadow = shadowToken.ambient;

  return {
    key: {
      shadowColor: 'blue', //shadowColorFromRGBAColor(keyShadow.color),
      shadowOpacity: 1, //shadowOpacityFromRGBAColor(keyShadow.color),
      shadowRadius: 20, //keyShadow.blur,
      shadowOffset: {
        width: 10, //keyShadow.x,
        height: 0, //keyShadow.y,
      },
    },
    ambient: {
      shadowColor: 'red', //shadowColorFromRGBAColor(ambientShadow.color),
      shadowOpacity: 1, //shadowOpacityFromRGBAColor(ambientShadow.color),
      shadowRadius: 20, // ambientShadow.blur,
      shadowOffset: {
        width: -10, //ambientShadow.x,
        height: 0, //ambientShadow.y,
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
