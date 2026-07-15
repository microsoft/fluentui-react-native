import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius40,
  cornerRadius80,
  cornerRadiusCircular,
  cornerRadiusNone,
  size120,
  size200,
  size40,
  size80,
  strokeWidth10,
  strokeWidth20,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ButtonTokens } from './Button.types';

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = () =>
  ({
    focused: {
      borderWidth: strokeWidth20,
      borderInnerWidth: strokeWidth10,
    },
    subtle: {
      focused: {
        borderWidth: strokeWidth20,
        borderInnerWidth: strokeWidth10,
      },
    },
    outline: {
      borderWidth: strokeWidth10,
      disabled: {
        borderWidth: strokeWidth10,
      },
      pressed: {
        borderWidth: strokeWidth10,
      },
      focused: {
        borderWidth: strokeWidth20,
        borderInnerWidth: strokeWidth10,
      },
    },
    block: {
      width: '100%',
    },
    large: {
      paddingHorizontal: size200,
      borderRadius: cornerRadius80,
      iconSize: 20,
      outline: {
        borderWidth: strokeWidth10,
        iconSize: 20,
      },
      spacingIconContentBefore: size80,
      spacingIconContentAfter: size80,
      minHeight: 48,
      minWidth: 36,
    },
    medium: {
      paddingHorizontal: size120,
      borderRadius: cornerRadius40,
      iconSize: 20,
      outline: {
        borderWidth: strokeWidth10,
        iconSize: 20,
      },
      spacingIconContentBefore: size80,
      spacingIconContentAfter: size80,
      minHeight: 36,
      minWidth: 36,
    },
    small: {
      paddingHorizontal: size80,
      borderRadius: cornerRadius40,
      iconSize: 16,
      outline: {
        borderWidth: strokeWidth10,
        iconSize: 16,
      },
      spacingIconContentBefore: size40,
      spacingIconContentAfter: size40,
      minHeight: 28,
      minWidth: 28,
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
