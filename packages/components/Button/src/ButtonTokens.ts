import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from './Button.types';

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = () =>
  ({
    block: {
      width: '100%',
    },
    medium: {
      padding: globalTokens.spacing.sNudge - globalTokens.stroke.width10,
      borderWidth: globalTokens.stroke.width10,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: globalTokens.spacing.sNudge,
      },
      hasContent: {
        minWidth: 96,
        paddingHorizontal: globalTokens.spacing.m - globalTokens.stroke.width10,
        hasIconAfter: {
          spacingIconContentAfter: globalTokens.spacing.sNudge,
        },
        hasIconBefore: {
          spacingIconContentBefore: globalTokens.spacing.sNudge,
        },
        focused: {
          paddingHorizontal: globalTokens.spacing.m,
        },
      },
    },
    small: {
      padding: globalTokens.spacing.xs - globalTokens.stroke.width10,
      borderWidth: globalTokens.stroke.width10,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: globalTokens.spacing.xs,
      },
      hasContent: {
        minWidth: 64,
        paddingHorizontal: globalTokens.spacing.s - globalTokens.stroke.width10,
        hasIconAfter: {
          spacingIconContentAfter: globalTokens.spacing.xs,
        },
        hasIconBefore: {
          spacingIconContentBefore: globalTokens.spacing.xs,
        },
        focused: {
          paddingHorizontal: globalTokens.spacing.s,
        },
      },
    },
    large: {
      padding: globalTokens.spacing.s - globalTokens.stroke.width10,
      borderWidth: globalTokens.stroke.width10,
      iconSize: 20,
      focused: {
        borderWidth: 0,
        padding: globalTokens.spacing.s,
      },
      hasContent: {
        minWidth: 96,
        paddingHorizontal: globalTokens.spacing.l - globalTokens.stroke.width10,
        hasIconAfter: {
          spacingIconContentAfter: globalTokens.spacing.sNudge,
        },
        hasIconBefore: {
          spacingIconContentBefore: globalTokens.spacing.sNudge,
        },
        focused: {
          paddingHorizontal: globalTokens.spacing.l,
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
