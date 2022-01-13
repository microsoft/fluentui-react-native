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
      padding: globalTokens.spacing.sNudge - globalTokens.stroke.width.thin,
      borderWidth: globalTokens.stroke.width.thin,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: globalTokens.spacing.sNudge,
      },
      hasContent: {
        minWidth: 96,
        paddingHorizontal: globalTokens.spacing.m - globalTokens.stroke.width.thin,
        variant: 'bodySemibold',
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
      padding: globalTokens.spacing.xs - globalTokens.stroke.width.thin,
      borderWidth: globalTokens.stroke.width.thin,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: globalTokens.spacing.xs,
      },
      hasContent: {
        minWidth: 64,
        paddingHorizontal: globalTokens.spacing.s - globalTokens.stroke.width.thin,
        variant: 'secondaryStandard',
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
      padding: globalTokens.spacing.s - globalTokens.stroke.width.thin,
      borderWidth: globalTokens.stroke.width.thin,
      iconSize: 20,
      focused: {
        borderWidth: 0,
        padding: globalTokens.spacing.s,
      },
      hasContent: {
        minWidth: 96,
        paddingHorizontal: globalTokens.spacing.l - globalTokens.stroke.width.thin,
        variant: 'subheaderSemibold',
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
      borderRadius: globalTokens.corner.radius.medium,
    },
    circular: {
      borderRadius: globalTokens.corner.radius.circle,
    },
    square: {
      borderRadius: globalTokens.corner.radius.none,
    },
  } as ButtonTokens);
