import { ColorValue } from 'react-native';

export interface IMockTheme {
  textSizes: {
    small: number;
    medium: number;
    large: number;
  };
  textWeights: {
    normal: string;
    bold: string;
  };
  colors: {
    windowBackground: ColorValue;
    windowText: ColorValue;
    buttonBackground: ColorValue;
    buttonText: ColorValue;
  };
}

export const theme: IMockTheme = {
  textSizes: {
    small: 10,
    medium: 12,
    large: 14,
  },
  textWeights: {
    normal: '400',
    bold: '700',
  },
  colors: {
    windowBackground: 'white',
    windowText: 'black',
    buttonBackground: 'blue',
    buttonText: 'yellow',
  },
};
