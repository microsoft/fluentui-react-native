import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius40,
  cornerRadiusCircular,
  cornerRadiusNone,
  size120,
  size160,
  size40,
  size60,
  size80,
  strokeWidth10,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ButtonTokens } from './Button.types';

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = () =>
  ({
    block: {
      width: '100%',
    },
    medium: {
      padding: size60 - strokeWidth10,
      borderWidth: strokeWidth10,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: size60,
      },
      hasContent: {
        minWidth: 96,
        paddingHorizontal: size120 - strokeWidth10,
        hasIconAfter: {
          spacingIconContentAfter: size60,
        },
        hasIconBefore: {
          spacingIconContentBefore: size60,
        },
        focused: {
          paddingHorizontal: size120,
        },
      },
    },
    small: {
      padding: size40 - strokeWidth10,
      borderWidth: strokeWidth10,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: size40,
      },
      hasContent: {
        minWidth: 64,
        minHeight: 24,
        paddingHorizontal: size80 - strokeWidth10,
        hasIconAfter: {
          spacingIconContentAfter: size40,
        },
        hasIconBefore: {
          spacingIconContentBefore: size40,
        },
        focused: {
          paddingHorizontal: size80,
        },
      },
    },
    large: {
      padding: size80 - strokeWidth10,
      borderWidth: strokeWidth10,
      iconSize: 20,
      focused: {
        borderWidth: 0,
        padding: size80,
      },
      hasContent: {
        minWidth: 96,
        paddingHorizontal: size160 - strokeWidth10,
        hasIconAfter: {
          spacingIconContentAfter: size60,
        },
        hasIconBefore: {
          spacingIconContentBefore: size60,
        },
        focused: {
          paddingHorizontal: size160,
        },
      },
    },
    rounded: {
      borderRadius: cornerRadius40,
    },
    circular: {
      borderRadius: cornerRadiusCircular,
    },
    square: {
      borderRadius: cornerRadiusNone,
    },
  }) as ButtonTokens;
