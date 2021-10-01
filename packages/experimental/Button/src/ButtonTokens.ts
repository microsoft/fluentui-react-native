import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from './Button.types';

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = () =>
  ({
    fluid: {
      width: '100%',
    },
    fab: {
      borderRadius: globalTokens.corner.radius.circle, // big number for always rounded corners
      // For large size
      minHeight: 56,
      minWidth: 56,
      padding: globalTokens.spacing.l,
      hasContent: {
        hasIcon: {
          spacingIconContent: globalTokens.spacing.mNudge,
        },
      },
    },
    medium: {
      padding: globalTokens.spacing.sNudge - globalTokens.stroke.width.thin,
      borderWidth: globalTokens.stroke.width.thin,
      borderRadius: globalTokens.corner.radius.medium,
      iconSize: 16,
      hasContent: {
        minWidth: 96,
        paddingHorizontal: globalTokens.spacing.l - globalTokens.stroke.width.thin,
        variant: 'bodySemibold',
        hasIcon: {
          spacingIconContent: globalTokens.spacing.sNudge,
        },
      },
    },
    small: {
      padding: globalTokens.spacing.xs - globalTokens.stroke.width.thin,
      borderWidth: globalTokens.stroke.width.thin,
      borderRadius: globalTokens.corner.radius.medium,
      iconSize: 16,
      hasContent: {
        minWidth: 64,
        paddingHorizontal: globalTokens.spacing.m - globalTokens.stroke.width.thin,
        variant: 'secondaryStandard',
        hasIcon: {
          spacingIconContent: globalTokens.spacing.xs,
        },
      },
    },
    large: {
      padding: globalTokens.spacing.s - globalTokens.stroke.width.thin,
      borderWidth: globalTokens.stroke.width.thin,
      borderRadius: globalTokens.corner.radius.medium,
      iconSize: 20,
      hasContent: {
        minWidth: 96,
        paddingHorizontal: globalTokens.spacing.l - globalTokens.stroke.width.thin,
        variant: 'subheaderSemibold',
        hasIcon: {
          spacingIconContent: globalTokens.spacing.sNudge,
        },
      },
    },
  } as ButtonTokens);
