import type { Theme } from '@fluentui-react-native/framework';
import { size120, size160, size200, size80, strokeWidth10, strokeWidth20 } from '@fluentui-react-native/design/tokens/global';
import { isHighContrast } from '@fluentui-react-native/theming-utils';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonTokens: TokenSettings<CompoundButtonTokens, Theme> = (theme: Theme): CompoundButtonTokens => ({
  medium: {
    padding: size120 - strokeWidth10,
    focused: {
      padding: size120,
    },
    primary: !isHighContrast(theme) && {
      focused: {
        borderWidth: strokeWidth20,
        padding: size120 - strokeWidth20,
      },
      square: {
        focused: {
          borderWidth: strokeWidth10,
          padding: size120 - strokeWidth10,
        },
      },
    },
    hasContent: {
      paddingHorizontal: size120 - strokeWidth10,
      minWidth: 96,
      focused: {
        paddingHorizontal: size120,
      },
      primary: !isHighContrast(theme) && {
        focused: {
          paddingHorizontal: size120 - strokeWidth20,
        },
        circular: {
          focused: {
            paddingHorizontal: size160 - strokeWidth20,
          },
        },
        square: {
          focused: {
            paddingHorizontal: size120 - strokeWidth10,
          },
        },
      },
      hasIconAfter: {
        spacingIconContentAfter: size120,
      },
      hasIconBefore: {
        spacingIconContentBefore: size120,
      },
      circular: {
        paddingHorizontal: size160 - strokeWidth10,
        focused: {
          paddingHorizontal: size160,
        },
      },
    },
  },
  small: {
    padding: size80 - strokeWidth10,
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
      paddingHorizontal: size80 - strokeWidth10,
      minWidth: 64,
      focused: {
        paddingHorizontal: size80,
      },
      primary: !isHighContrast(theme) && {
        focused: {
          paddingHorizontal: size80 - strokeWidth20,
        },
        circular: {
          focused: {
            paddingHorizontal: size120 - strokeWidth20,
          },
        },
        square: {
          focused: {
            paddingHorizontal: size80 - strokeWidth10,
          },
        },
      },
      hasIconAfter: {
        spacingIconContentAfter: size80,
      },
      hasIconBefore: {
        spacingIconContentBefore: size80,
      },
      circular: {
        paddingHorizontal: size120 - strokeWidth10,
        focused: {
          paddingHorizontal: size120,
        },
      },
    },
  },
  large: {
    padding: size160 - strokeWidth10,
    focused: {
      padding: size160,
    },
    primary: !isHighContrast(theme) && {
      focused: {
        borderWidth: strokeWidth20,
        padding: size160 - strokeWidth20,
      },
      square: {
        focused: {
          borderWidth: strokeWidth10,
          padding: size160 - strokeWidth10,
        },
      },
    },
    hasContent: {
      paddingHorizontal: size160 - strokeWidth10,
      minWidth: 96,
      focused: {
        paddingHorizontal: size160,
      },
      primary: !isHighContrast(theme) && {
        focused: {
          paddingHorizontal: size160 - strokeWidth20,
        },
        circular: {
          focused: {
            paddingHorizontal: size200 - strokeWidth20,
          },
        },
        square: {
          focused: {
            paddingHorizontal: size160 - strokeWidth10,
          },
        },
      },
      hasIconAfter: {
        spacingIconContentAfter: size160,
      },
      hasIconBefore: {
        spacingIconContentBefore: size160,
      },
      circular: {
        paddingHorizontal: size200 - strokeWidth10,
        focused: {
          paddingHorizontal: size200,
        },
      },
    },
  },
});
