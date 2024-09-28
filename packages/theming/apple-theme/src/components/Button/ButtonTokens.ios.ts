import type { DimensionValue } from 'react-native';

import { globalTokensIOS as globalTokens } from '@fluentui-react-native/theme-tokens';
import type { Theme } from '@fluentui-react-native/theme-types';

export const defaultButtonTokens = (_t: Theme) => ({
  block: {
    width: '100%' as DimensionValue,
  },
  medium: {
    paddingHorizontal: globalTokens.size120,
    borderWidth: globalTokens.stroke.width10,
    borderRadius: globalTokens.corner.radius80,
    minHeight: 40,
    iconSize: 20,
    focused: {
      borderWidth: 0,
    },
    hasContent: {
      minWidth: 96,
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size80,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size80,
      },
    },
  },
  small: {
    paddingHorizontal: globalTokens.size60,
    borderWidth: globalTokens.stroke.width10,
    borderRadius: globalTokens.corner.radius80,
    minHeight: 28,
    iconSize: 16,
    focused: {
      borderWidth: 0,
    },
    hasContent: {
      minWidth: 64,
      minHeight: 28,
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size40,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size40,
      },
    },
  },
  large: {
    paddingHorizontal: globalTokens.size160,
    borderWidth: globalTokens.stroke.width10,
    iconSize: 20,
    borderRadius: globalTokens.corner.radius120,
    minHeight: 52,
    focused: {
      borderWidth: 0,
    },
    hasContent: {
      minWidth: 96,
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size80,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size80,
      },
    },
  },
  circular: {
    borderRadius: globalTokens.corner.radiusCircular,
  },
  square: {
    borderRadius: globalTokens.corner.radiusNone,
  },
  getPlatformSpecificAppearance: (appearance): 'accent' | 'primary' | 'subtle' | 'outline' => {
    switch (appearance) {
      case 'accent': // Included to cover Mobile platform naming guidelines, maps to 'primary'.
        return 'primary';

      case 'primary':
      case 'subtle':
      case 'outline': // 'Outline' exists only for Mobile platforms, default picked on other platforms.
        return appearance;

      default:
        return 'primary';
    }
  },
});
