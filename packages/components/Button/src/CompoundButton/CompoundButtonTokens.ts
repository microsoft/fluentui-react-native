import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonTokens: TokenSettings<CompoundButtonTokens, Theme> = (): CompoundButtonTokens => ({
  medium: {
    padding: globalTokens.size120 - globalTokens.stroke.width10,
    focused: {
      padding: globalTokens.size120,
    },
    hasContent: {
      paddingHorizontal: globalTokens.size120 - globalTokens.stroke.width10,
      minWidth: 96,
      focused: {
        paddingHorizontal: globalTokens.size120,
      },
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size120,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size120,
      },
    },
  },
  small: {
    padding: globalTokens.size80 - globalTokens.stroke.width10,
    focused: {
      padding: globalTokens.size80,
    },
    hasContent: {
      paddingHorizontal: globalTokens.size80 - globalTokens.stroke.width10,
      minWidth: 64,
      focused: {
        paddingHorizontal: globalTokens.size80,
      },
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size80,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size80,
      },
    },
  },
  large: {
    padding: globalTokens.size160 - globalTokens.stroke.width10,
    focused: {
      padding: globalTokens.size160,
    },
    hasContent: {
      paddingHorizontal: globalTokens.size160 - globalTokens.stroke.width10,
      minWidth: 96,
      focused: {
        paddingHorizontal: globalTokens.size160,
      },
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size160,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size160,
      },
    },
  },
});
