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
    windowBackground: string;
    windowText: string;
    buttonBackground: string;
    buttonText: string;
  };
}

export const theme: IMockTheme = {
  textSizes: {
    small: 10,
    medium: 12,
    large: 14
  },
  textWeights: {
    normal: '400',
    bold: '700'
  },
  colors: {
    windowBackground: 'white',
    windowText: 'black',
    buttonBackground: 'blue',
    buttonText: 'yellow'
  }
};
