import { Spacing, Theme } from '@fluentui-react-native/theme-types';
import { PlatformColor } from 'react-native';
import { fallbackApplePalette } from './appleColors.macos';
import { fallbackAppleTypography } from './appleTypography.macos';

export function appleSpacing(): Spacing {
  return {
    s2: '8px',
    s1: '12px',
    m: '16px',
    l1: '20px',
    l2: '24px',
  };
}

export const appleComponents = {
  // These values correspond to the "Large"  Button Size values of the FluentUI Apple Button
  Button: {
    tokens: {
      borderRadius: 6,
      borderWidth: 1,
      minHeight: 28,
      minWidth: 72,
    },
    root: {
      style: {
        margin: 8, // Padding around the outside of the button
      },
    },
    stack: {
      style: {
        paddingVertical: 4.5,
        minHeight: 28,
      },
    },
    icon: {
      style: {
        marginEnd: 10,
      },
    },
    content: {
      fontSize: 15,
    },
  },
  RNFText: {
    tokens: {
      variant: 'bodyStandard',
    },
  },
  RadioButton: {
    tokens: {
      borderColor: 'rgba(0, 0, 0, 0.15)',
      backgroundColor: 'white',
    },
    root: {
      accessible: false,
      focusable: false,
    },
    button: {
      style: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: 14,
        height: 14,
        borderRadius: 7,
      },
      accessible: true,
      focusable: true,
    },
    innerCircle: {
      style: {
        height: 6.5,
        borderRadius: 3.5,
        width: 6.5,
        left: 3,
        top: 2.5,
      },
    },
    content: {
      variant: 'bodyStandard',
    },
    _overrides: {
      selected: {
        innerCircle: {
          style: {
            opacity: 1,
          },
        },
        hovered: {
          innerCircle: {
            style: {
              opacity: 0,
            },
          },
        },
        button: {
          backgroundColor: PlatformColor('controlAccentColor'),
        },
      },
      focused: {
        button: {
          enableFocusRing: true,
        },
      },
      disabled: {
        focusable: false,
        accessible: false,
        tokens: {
          borderColor: 'rgba(0, 0, 0, 0.15)',
          backgroundColor: 'rgba(255, 255, 255, 1)',
        },
      },
    },
  },
};

/** The apple theme defined entirely in JS, intended as a fallback while the native module loads
 * or if the native module is not found
 */
export const BaseAppleThemeMacOS: Theme = {
  colors: fallbackApplePalette(),
  typography: fallbackAppleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'dynamic' },
};
