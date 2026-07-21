import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius40,
  cornerRadiusCircular,
  cornerRadiusNone,
  size100,
  size120,
  size160,
  size40,
  size60,
  size80,
  strokeWidth10,
  strokeWidth20,
} from '@fluentui-react-native/design/tokens/global';
import { isHighContrast } from '@fluentui-react-native/design/theming';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ButtonTokens } from './Button.types';

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = (theme: Theme) =>
  ({
    borderWidth: strokeWidth10,
    borderInnerWidth: strokeWidth10,
    block: {
      width: '100%',
    },
    medium: {
      padding: size80 - strokeWidth10,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: size80,
      },
      primary: !isHighContrast(theme) && {
        focused: {
          borderWidth: strokeWidth20,
          padding: size80 - strokeWidth20,
        },
        square: {
          focused: {
            borderWidth: strokeWidth10,
            padding: size80 - strokeWidth10,
          },
        },
      },
      hasContent: {
        minWidth: 96,
        padding: size60 - strokeWidth10,
        paddingHorizontal: size120 - strokeWidth10,
        hasIconAfter: {
          spacingIconContentAfter: size80,
        },
        hasIconBefore: {
          spacingIconContentBefore: size80,
        },
        focused: {
          padding: size60,
          paddingHorizontal: size120,
        },
        primary: !isHighContrast(theme) && {
          focused: {
            padding: size60 - strokeWidth20,
            paddingHorizontal: size120 - strokeWidth20,
          },
          square: {
            focused: {
              padding: size60 - strokeWidth10,
              paddingHorizontal: size120 - strokeWidth10,
            },
          },
        },
      },
    },
    small: {
      padding: size40 - strokeWidth10,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: size40,
      },
      primary: !isHighContrast(theme) && {
        focused: {
          borderWidth: strokeWidth20,
          padding: size40 - strokeWidth20,
        },
        square: {
          focused: {
            borderWidth: strokeWidth10,
            padding: size40 - strokeWidth10,
          },
        },
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
        primary: !isHighContrast(theme) && {
          focused: {
            paddingHorizontal: size80 - strokeWidth20,
          },
          square: {
            focused: {
              paddingHorizontal: size80 - strokeWidth10,
            },
          },
        },
      },
    },
    large: {
      padding: size100 - strokeWidth10,
      iconSize: 20,
      focused: {
        borderWidth: 0,
        padding: size100,
      },
      primary: !isHighContrast(theme) && {
        focused: {
          borderWidth: strokeWidth20,
          padding: size100 - strokeWidth20,
        },
        square: {
          focused: {
            borderWidth: strokeWidth10,
            padding: size100 - strokeWidth10,
          },
        },
      },
      hasContent: {
        minWidth: 96,
        minHeight: 40,
        padding: size80 - strokeWidth10,
        paddingHorizontal: size160 - strokeWidth10,
        hasIconAfter: {
          spacingIconContentAfter: size60,
        },
        hasIconBefore: {
          spacingIconContentBefore: size60,
        },
        focused: {
          padding: size80,
          paddingHorizontal: size160,
        },
        primary: !isHighContrast(theme) && {
          focused: {
            padding: size80 - strokeWidth20,
            paddingHorizontal: size160 - strokeWidth20,
          },
          square: {
            focused: {
              padding: size80 - strokeWidth10,
              paddingHorizontal: size160 - strokeWidth10,
            },
          },
        },
      },
    },
    rounded: {
      borderRadius: cornerRadius40,
      borderInnerRadius: cornerRadius40 - 1, // reduce the rounding so that the curvature matches
    },
    circular: {
      borderRadius: cornerRadiusCircular,
      borderInnerRadius: cornerRadiusCircular - 1, // reduce the rounding so that the curvature matches
    },
    square: {
      borderRadius: cornerRadiusNone,
      borderInnerRadius: cornerRadiusNone,
    },
  }) as ButtonTokens;
