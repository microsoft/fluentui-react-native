import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonTokens: TokenSettings<CompoundButtonTokens, Theme> = (): CompoundButtonTokens => ({
  medium: {
    padding: globalTokens.spacing.m - globalTokens.stroke.width10,
    focused: {
      padding: globalTokens.spacing.m,
    },
    hasContent: {
      paddingHorizontal: globalTokens.spacing.m - globalTokens.stroke.width10,
      minWidth: 96,
      focused: {
        paddingHorizontal: globalTokens.spacing.m,
      },
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.spacing.m,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.spacing.m,
      },
    },
  },
  small: {
    padding: globalTokens.spacing.s - globalTokens.stroke.width10,
    focused: {
      padding: globalTokens.spacing.s,
    },
    hasContent: {
      paddingHorizontal: globalTokens.spacing.s - globalTokens.stroke.width10,
      minWidth: 64,
      focused: {
        paddingHorizontal: globalTokens.spacing.s,
      },
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.spacing.s,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.spacing.s,
      },
    },
  },
  large: {
    padding: globalTokens.spacing.l - globalTokens.stroke.width10,
    focused: {
      padding: globalTokens.spacing.l,
    },
    hasContent: {
      paddingHorizontal: globalTokens.spacing.l - globalTokens.stroke.width10,
      minWidth: 96,
      focused: {
        paddingHorizontal: globalTokens.spacing.l,
      },
      hasIconAfter: {
        spacingIconContentAfter: globalTokens.spacing.l,
      },
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.spacing.l,
      },
    },
  },
});
