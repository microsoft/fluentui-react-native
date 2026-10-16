import type { Theme } from '@fluentui-react-native/framework';
import { size120, size160, size200, size80, strokeWidth10 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonTokens: TokenSettings<CompoundButtonTokens, Theme> = (): CompoundButtonTokens => ({
  medium: {
    padding: size120 - strokeWidth10,
    focused: {
      padding: size120,
    },
    hasContent: {
      paddingHorizontal: size120 - strokeWidth10,
      minWidth: 96,
      focused: {
        paddingHorizontal: size120,
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
      padding: size80,
    },
    hasContent: {
      paddingHorizontal: size80 - strokeWidth10,
      minWidth: 64,
      focused: {
        paddingHorizontal: size80,
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
    hasContent: {
      paddingHorizontal: size160 - strokeWidth10,
      minWidth: 96,
      focused: {
        paddingHorizontal: size160,
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
