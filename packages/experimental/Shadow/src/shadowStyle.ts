import { Theme, memoize } from '@fluentui-react-native/framework';
import { ColorValue } from 'react-native';
import { ShadowDepth } from './Shadow.types';

export const getShadowTokenStyleSet = memoize(getShadowTokenStyleSetWorker);

function getShadowTokenStyleSetWorker(t: Theme, depth: ShadowDepth) {
  const keyShadow = t.shadows[depth.toString()].key;
  const ambientShadow = t.shadows[depth.toString()].ambient;

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
