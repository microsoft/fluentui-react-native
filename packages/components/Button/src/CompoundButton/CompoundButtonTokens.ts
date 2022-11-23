import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonTokens: TokenSettings<CompoundButtonTokens, Theme> = (): CompoundButtonTokens => ({
  medium: {
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
  small: {
    padding: globalTokens.size120 - globalTokens.stroke.width10,
    focused: {
      padding: globalTokens.size120,
    },
    hasContent: {
      paddingHorizontal: globalTokens.size120 - globalTokens.stroke.width10,
      minWidth: 64,
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
  large: {
    padding: globalTokens.size200 - globalTokens.stroke.width10,
    focused: {
      padding: globalTokens.size200,
    },
    hasContent: {
      paddingHorizontal: globalTokens.size200 - globalTokens.stroke.width10,
      minWidth: 96,
      focused: {
        paddingHorizontal: globalTokens.size200,
      },
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.size200,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.size200,
      },
    },
  },
});
