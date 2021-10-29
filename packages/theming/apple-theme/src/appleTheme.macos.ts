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
  Checkbox: {
    checkbox: {
      style: {
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderRadius: 3,
        minHeight: 14,
        minWidth: 14,
        marginEnd: 5,
      },
    },
    checkmarkIcon: {
      width: 10,
      height: 10,
      style: {
        marginVertical: 2,
        marginHorizontal: 2,
      },
    },
    // This disables other available states like: hovered, focused, pressed.
    _precedence: ['disabled', 'boxAtEnd', 'checked'],
  },
  ContextualMenuItem: {
    root: {
      style: {
        borderRadius: 5,
      },
    },
    stack: {
      style: {
        minHeight: 0,
        minWidth: 0,
      },
    },
    _overrides: {
      hovered: {
        tokens: {
          color: 'white',
          backgroundColor: PlatformColor('controlAccentColor'),
        },
      },
    },
  },
  submenuItem: {
    root: {
      style: {
        borderRadius: 5,
      },
    },
    leftstack: {
      style: {
        minHeight: 0,
        minWidth: 0,
      },
    },
    rightstack: {
      style: {
        minHeight: 0,
        minWidth: 0,
      },
    },
    _overrides: {
      hovered: {
        tokens: {
          color: 'white',
          backgroundColor: PlatformColor('controlAccentColor'),
        },
      },
    },
  },
};

export function getBaseAppleThemeMacOS(): Theme {
  return {
    colors: fallbackApplePalette(),
    typography: fallbackAppleTypography(),
    spacing: appleSpacing(),
    components: appleComponents,
    host: { appearance: 'dynamic' },
  };
}
