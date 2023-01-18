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
