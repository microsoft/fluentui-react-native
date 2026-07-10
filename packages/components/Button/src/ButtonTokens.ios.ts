import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius120,
  cornerRadius80,
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
      paddingHorizontal: size120,
      borderWidth: strokeWidth10,
      borderRadius: cornerRadius80,
      minHeight: 40,
      iconSize: 20,
      focused: {
        borderWidth: 0,
      },
      hasContent: {
        minWidth: 96,
        hasIconAfter: {
          spacingIconContentAfter: size80,
        },
        hasIconBefore: {
          spacingIconContentBefore: size80,
        },
      },
    },
    small: {
      paddingHorizontal: size60,
      borderWidth: strokeWidth10,
      borderRadius: cornerRadius80,
      minHeight: 28,
      iconSize: 16,
      focused: {
        borderWidth: 0,
      },
      hasContent: {
        minWidth: 64,
        minHeight: 28,
        hasIconAfter: {
          spacingIconContentAfter: size40,
        },
        hasIconBefore: {
          spacingIconContentBefore: size40,
        },
      },
    },
    large: {
      paddingHorizontal: size160,
      borderWidth: strokeWidth10,
      iconSize: 20,
      borderRadius: cornerRadius120,
      minHeight: 52,
      focused: {
        borderWidth: 0,
      },
      hasContent: {
        minWidth: 96,
        hasIconAfter: {
          spacingIconContentAfter: size80,
        },
        hasIconBefore: {
          spacingIconContentBefore: size80,
        },
      },
    },
    circular: {
      borderRadius: cornerRadiusCircular,
    },
    square: {
      borderRadius: cornerRadiusNone,
    },
  }) as ButtonTokens;
