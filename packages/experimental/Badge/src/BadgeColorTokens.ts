import { Theme, TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';

export const defaultBadgeColorTokens: TokenSettings<BadgeTokens> = (t: Theme) =>
  ({
    filled: {
      backgroundColor: t.colors.brandedBackground,
      color: t.colors.neutralForegroundInverted,
      iconColor: t.colors.neutralForegroundInverted,
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: t.colors.transparentBackground,
      color: t.colors.brandForeground1,
      borderColor: t.colors.brandForeground1,
      iconColor: t.colors.brandForeground1,
    },
    tint: {
      backgroundColor: globalTokens.color.brand.tint60,
      color: t.colors.brandForeground1,
      borderColor: '#B4D6FA',
      iconColor: t.colors.brandForeground1,
    },
    brand: {
      filled: {
        backgroundColor: t.colors.brandBackgroundStatic,
        color: t.colors.neutralForegroundOnBrand,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      outline: {
        color: t.colors.brandForeground1,
        borderColor: t.colors.brandForeground1,
        iconColor: t.colors.brandForeground1,
      },
      tint: {
        backgroundColor: globalTokens.color.brand.tint60,
        color: t.colors.brandForeground1,
        borderColor: '#B4D6FA',
        iconColor: t.colors.brandForeground1,
      },
    },
    danger: {
      filled: {
        backgroundColor: globalTokens.color.red.primary,
        color: t.colors.neutralForegroundOnBrand,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      outline: {
        color: globalTokens.color.red.primary,
        borderColor: globalTokens.color.red.primary,
        iconColor: globalTokens.color.red.primary,
      },
      tint: {
        backgroundColor: globalTokens.color.red.tint60,
        color: globalTokens.color.red.primary,
        borderColor: '#F1BBBD',
        iconColor: globalTokens.color.red.primary,
      },
    },
    important: {
      filled: {
        backgroundColor: globalTokens.color.grey[14],
        color: t.colors.neutralForegroundOnBrand,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      outline: {
        color: globalTokens.color.grey[14],
        iconColor: globalTokens.color.grey[14],
      },
      tint: {
        backgroundColor: globalTokens.color.grey[38],
        color: t.colors.neutralForegroundOnBrand,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
    },
    informative: {
      filled: {
        backgroundColor: globalTokens.color.grey[92],
        color: globalTokens.color.grey[38],
        iconColor: globalTokens.color.grey[38],
      },
    },
    severe: {
      filled: {
        backgroundColor: globalTokens.color.darkOrange.primary,
        color: t.colors.neutralForegroundOnBrand,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      outline: {
        color: globalTokens.color.darkOrange.tint20,
        iconColor: globalTokens.color.darkOrange.tint20,
        borderColor: globalTokens.color.darkOrange.tint20,
      },
      tint: {
        backgroundColor: '#411100',
        color: globalTokens.color.office.tint40,
        iconColor: globalTokens.color.office.tint40,
        borderColor: globalTokens.color.office.tint40,
      },
    },
    subtle: {
      filled: {
        backgroundColor: t.colors.transparentBackground,
        color: globalTokens.color.grey[14],
        iconColor: globalTokens.color.grey[14],
      },
    },
    success: {
      filled: {
        backgroundColor: globalTokens.color.green.primary,
        color: t.colors.neutralForegroundOnBrand,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      outline: {
        color: globalTokens.color.green.primary,
        iconColor: globalTokens.color.green.primary,
        borderColor: globalTokens.color.green.primary,
      },
      tint: {
        backgroundColor: globalTokens.color.green.tint60,
        color: globalTokens.color.green.primary,
        iconColor: globalTokens.color.green.primary,
        borderColor: '#A0D8A0',
      },
    },
    warning: {
      filled: {
        backgroundColor: globalTokens.color.yellow.primary,
        color: globalTokens.color.grey[14],
        iconColor: globalTokens.color.grey[14],
      },
      outline: {
        color: globalTokens.color.yellow.tint40,
        iconColor: globalTokens.color.yellow.tint40,
        borderColor: globalTokens.color.yellow.tint40,
      },
      tint: {
        backgroundColor: globalTokens.color.yellow.shade40,
        color: globalTokens.color.yellow.tint40,
        iconColor: globalTokens.color.yellow.tint40,
        borderColor: globalTokens.color.yellow.tint40,
      },
    },
  } as BadgeTokens);
