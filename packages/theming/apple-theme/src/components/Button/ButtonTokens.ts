import type { DimensionValue } from 'react-native';

import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { Theme } from '@fluentui-react-native/theme-types';

export const defaultButtonTokens = (_t: Theme) => ({
  block: {
    width: '100%' as DimensionValue,
  },
  medium: {
    padding: globalTokens.size60 - globalTokens.stroke.width10,
    borderWidth: globalTokens.stroke.width10,
    iconSize: 16,
    focused: {
      borderWidth: 0,
      padding: globalTokens.size60,
    },
    hasContent: {
      minWidth: 96,
      paddingHorizontal: globalTokens.size120 - globalTokens.stroke.width10,
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size60,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size60,
      },
      focused: {
        paddingHorizontal: globalTokens.size120,
      },
    },
  },
  small: {
    padding: globalTokens.size40 - globalTokens.stroke.width10,
    borderWidth: globalTokens.stroke.width10,
    iconSize: 16,
    focused: {
      borderWidth: 0,
      padding: globalTokens.size40,
    },
    hasContent: {
      minWidth: 64,
      minHeight: 24,
      paddingHorizontal: globalTokens.size80 - globalTokens.stroke.width10,
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size40,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size40,
      },
      focused: {
        paddingHorizontal: globalTokens.size80,
      },
    },
  },
  large: {
    padding: globalTokens.size80 - globalTokens.stroke.width10,
    borderWidth: globalTokens.stroke.width10,
    iconSize: 20,
    focused: {
      borderWidth: 0,
      padding: globalTokens.size80,
    },
    hasContent: {
      minWidth: 96,
      paddingHorizontal: globalTokens.size160 - globalTokens.stroke.width10,
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size60,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size60,
      },
      focused: {
        paddingHorizontal: globalTokens.size160,
      },
    },
  },
  rounded: {
    borderRadius: globalTokens.corner.radius40,
  },
  circular: {
    borderRadius: globalTokens.corner.radiusCircular,
  },
  square: {
    borderRadius: globalTokens.corner.radiusNone,
  },
  getPlatformSpecificAppearance: (appearance): 'primary' | 'subtle' | 'outline' | null => {
    switch (appearance) {
      case 'accent': // Included to cover Mobile platform naming guidelines, maps to 'primary'.
        return 'primary';

      case 'primary':
      case 'subtle':
      case 'outline': // 'Outline' exists only for Mobile platforms, default picked on other platforms.
        return appearance;

      default:
        return null;
    }
  },
});
