import { Theme, Spacing } from '@fluentui-react-native/theme-types';
import { paletteFromAppleColors } from './appleColors.ios';
import { appleTypography } from './appleTypography.ios';

function appleSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

const appleComponents = {
  // The Default Button corresponds to the "secondary outline" button style on iOS
  Button: {
    tokens: {
      borderRadius: 8,
      borderWidth: 1,
    },
    root: {
      style: {
        margin: 8, // Padding around the outside of the button
      },
    },
    stack: {
      style: {
        paddingVertical: 10,
        paddingHorizontal: 14,
      },
    },
    icon: {
      style: {
        marginEnd: 8,
      },
    },
    content: {
      fontSize: 12,
      height: 18,
    },
  },

  PrimaryButton: {
    tokens: {
      borderRadius: 8,
      borderWidth: 1,
    },
    root: {
      style: {
        margin: 8, // Padding around the outside of the button
      },
    },
    stack: {
      style: {
        paddingVertical: 16,
        paddingHorizontal: 20,
      },
    },
    icon: {
      style: {
        marginEnd: 10,
      },
    },
    content: {
      fontSize: 15,
      height: 20,
    },
  },

  StealthButton: {
    tokens: {
      borderRadius: 8,
      borderWidth: 1,
    },
    root: {
      style: {
        margin: 8, // Padding around the outside of the button
      },
    },
    stack: {
      style: {
        paddingVertical: 7,
        paddingHorizontal: 12,
      },
    },
    icon: {
      style: {
        display: 'none',
      },
    },
    content: {
      fontSize: 15,
      height: 20,
    },
  },

  RNFText: {
    tokens: {
      variant: 'bodyStandard',
    },
  },

  Checkbox: {
    root: {
      style: {
        minHeight: 20,
        marginVertical: 2,
      },
    },
    checkbox: {
      style: {
        borderRadius: 100,
        minHeight: 24,
        minWidth: 24,
      },
    },
    checkmarkIcon: {
      width: 8.5,
      height: 7,
      style: {
        marginVertical: 8.5,
        marginLeft: 8,
        marginRight: 7,
      },
    },
  },
};

// mocked out
const iOSShadows = {
  shadow2: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000001f' },
    key: { x: 0, y: 1, blur: 2, color: '#00000024' },
  },
  shadow4: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000001f' },
    key: { x: 0, y: 2, blur: 4, color: '#00000024' },
  },
  shadow8: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000001f' },
    key: { x: 0, y: 4, blur: 8, color: '#00000024' },
  },
  shadow16: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000001f' },
    key: { x: 0, y: 8, blur: 16, color: '#00000024' },
  },
  shadow28: {
    ambient: { x: 0, y: 0, blur: 8, color: '#00000033' },
    key: { x: 0, y: 14, blur: 28, color: '#0000003d' },
  },
  shadow64: {
    ambient: { x: 0, y: 0, blur: 8, color: '#00000033' },
    key: { x: 0, y: 32, blur: 64, color: '#0000003d' },
  },
  shadow2brand: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000004d' },
    key: { x: 0, y: 1, blur: 2, color: '#00000040' },
  },
  shadow4brand: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000004d' },
    key: { x: 0, y: 2, blur: 4, color: '#00000040' },
  },
  shadow8brand: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000004d' },
    key: { x: 0, y: 4, blur: 8, color: '#00000040' },
  },
  shadow16brand: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000004d' },
    key: { x: 0, y: 8, blur: 16, color: '#00000040' },
  },
  shadow28brand: {
    ambient: { x: 0, y: 0, blur: 8, color: '#0000004d' },
    key: { x: 0, y: 14, blur: 28, color: '#00000040' },
  },
  shadow64brand: {
    ambient: { x: 0, y: 0, blur: 8, color: '#0000004d' },
    key: { x: 0, y: 32, blur: 64, color: '#00000040' },
  },
};

export const BaseAppleLightThemeIOS: Theme = {
  colors: paletteFromAppleColors(false),
  typography: appleTypography(),
  shadows: iOSShadows,
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'light' },
};

export const BaseAppleDarkThemeIOS: Theme = {
  colors: paletteFromAppleColors(true),
  typography: appleTypography(),
  shadows: iOSShadows,
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'dark' },
};
