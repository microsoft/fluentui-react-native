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
};

export const BaseAppleLightThemeIOS: Theme = {
  colors: paletteFromAppleColors(false),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'light' },
};

export const BaseAppleDarkThemeIOS: Theme = {
  colors: paletteFromAppleColors(true),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'dark' },
};
