import { Theme } from '@fluentui-react-native/framework';
import { ColorValue } from 'react-native';

export const shadowStyleFromTheme = (t: Theme, shadowToken: string) => {
  const keyShadow = t.shadows[shadowToken].key;
  const ambientShadow = t.shadows[shadowToken].ambient;

  return {
    key: {
      // iOS Shadow props
      shadowColor: shadowColorFromRGBAColor(keyShadow.color),
      shadowOpacity: shadowOpacityFromRGBAColor(keyShadow.color),
      shadowRadius: keyShadow.blur,
      shadowOffset: {
        width: keyShadow.x,
        height: keyShadow.y,
      },
      // Android shadow props
      elevation: keyShadow.blur,
    },
    ambient: {
      // iOS Shadow props
      shadowColor: shadowColorFromRGBAColor(ambientShadow.color),
      shadowOpacity: shadowOpacityFromRGBAColor(ambientShadow.color),
      shadowRadius: ambientShadow.blur,
      shadowOffset: {
        width: ambientShadow.x,
        height: ambientShadow.y,
      },
      // Android shadow props
      elevation: ambientShadow.blur,
    },
  };
};

const shadowColorFromRGBAColor = (rgbaColor: ColorValue) => {
  return rgbaColor.toString().substring(0, 7);
};

const shadowOpacityFromRGBAColor = (rgbaColor: ColorValue) => {
  const opacityAsHex = '0x' + rgbaColor.toString().substring(7);
  const opacityAsDecimal = Number(opacityAsHex) / 255.0;

  // Round to two decimal places
  return Math.round(opacityAsDecimal * 100) / 100;
};
