import globalTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-global.json';

import { Theme, Spacing } from '@fluentui-react-native/theme-types';
import { paletteFromAppleColors } from './appleColors.ios';
import { appleTypography } from './appleTypography.ios';
import { iOSShadows } from './appleShadows.ios';

function appleSpacing(): Spacing {
  return {
    s2: '4px',
    s1: '8px',
    l1: '20px',
    l2: '32px',
    // v2 types,
    size100: globalTokens.size100,
    size120: globalTokens.size120,
    size1200: globalTokens.size1200,
    size160: globalTokens.size160,
    size20: globalTokens.size20,
    size200: globalTokens.size200,
    size240: globalTokens.size240,
    size280: globalTokens.size280,
    size320: globalTokens.size320,
    size360: globalTokens.size360,
    size40: globalTokens.size40,
    size400: globalTokens.size400,
    size480: globalTokens.size480,
    size560: globalTokens.size560,
    size60: globalTokens.size60,
    size640: globalTokens.size640,
    size720: globalTokens.size720,
    size80: globalTokens.size80,
    size800: globalTokens.size800,
    sizeNone: globalTokens.sizeNone,
  };
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

export function getBaseAppleThemeIOS(isLightMode: boolean): Theme {
  return {
    colors: paletteFromAppleColors(isLightMode),
    typography: appleTypography(),
    shadows: iOSShadows(),
    spacing: appleSpacing(),
    components: appleComponents,
    host: { appearance: isLightMode ? 'light' : 'dark' },
  };
}
