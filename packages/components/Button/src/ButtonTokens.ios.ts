import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ButtonTokens } from './Button.types';

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = () =>
  ({
    block: {
      width: '100%',
    },
    medium: {
      paddingHorizontal: globalTokens.size120,
      borderWidth: globalTokens.stroke.width10,
      minHeight: 40,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: globalTokens.size120,
      },
      hasContent: {
        minWidth: 96,
        paddingHorizontal: globalTokens.size120,
        hasIconAfter: {
          spacingIconContentAfter: globalTokens.size80,
        },
        hasIconBefore: {
          spacingIconContentBefore: globalTokens.size80,
        },
        focused: {
          paddingHorizontal: globalTokens.size120,
        },
      },
    },
    small: {
      padding: globalTokens.size60,
      borderWidth: globalTokens.stroke.width10,
      minHeight: 28,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: globalTokens.size60,
      },
      hasContent: {
        minWidth: 64,
        minHeight: 24,
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
    large: {
      paddingHorizontal: globalTokens.size160,
      borderWidth: globalTokens.stroke.width10,
      minHeight: 52,
      iconSize: 20,
      focused: {
        borderWidth: 0,
        padding: globalTokens.size160,
      },
      hasContent: {
        minWidth: 96,
        paddingHorizontal: globalTokens.size160,
        hasIconAfter: {
          spacingIconContentAfter: globalTokens.size80,
        },
        hasIconBefore: {
          spacingIconContentBefore: globalTokens.size80,
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
  } as ButtonTokens);
