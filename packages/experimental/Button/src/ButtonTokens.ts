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
      iconSize: 20,
      hasContent: {
        paddingHorizontal: globalTokens.spacing.m - globalTokens.stroke.width.thin,
        variant: 'bodySemibold',
        hasIcon: {
          spacingIconContent: globalTokens.spacing.sNudge,
        },
      },
    },
    small: {
      padding: globalTokens.spacing.xs - globalTokens.stroke.width.thin,
      borderWidth: globalTokens.stroke.width.thin,
      iconSize: 20,
      hasContent: {
        paddingHorizontal: globalTokens.spacing.s - globalTokens.stroke.width.thin,
        variant: 'secondaryStandard',
        hasIcon: {
          spacingIconContent: globalTokens.spacing.xs,
        },
      },
    },
    large: {
      padding: globalTokens.spacing.s - globalTokens.stroke.width.thin,
      borderWidth: globalTokens.stroke.width.thin,
      iconSize: 24,
      hasContent: {
        paddingHorizontal: globalTokens.spacing.l - globalTokens.stroke.width.thin,
        variant: 'subheaderSemibold',
        hasIcon: {
          spacingIconContent: globalTokens.spacing.sNudge,
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
