import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { BadgeTokens } from './Badge.types';

export const defaultBadgeTokens: TokenSettings<BadgeTokens, Theme> = () =>
  ({
    iconSize: 12,
    borderWidth: globalTokens.stroke.width10,
    bottom: globalTokens.sizeNone,
    right: globalTokens.sizeNone,
    textMargin: globalTokens.size20,
    position: 'relative',
    shadowToken: undefined,
    tiny: {
      minWidth: 6,
      minHeight: 6,
      rounded: {
        borderRadius: globalTokens.corner.radius20,
      },
    },
    extraSmall: {
      minWidth: 10,
      minHeight: 10,
      iconSize: 10,
      rounded: {
        borderRadius: globalTokens.corner.radius20,
      },
    },
    small: {
      minWidth: 16,
      minHeight: 16,
      iconSize: 12,
      paddingHorizontal: globalTokens.size20,
      textMargin: globalTokens.size20,
      rounded: {
        borderRadius: globalTokens.corner.radius20,
      },
    },
    medium: {
      minWidth: 20,
      minHeight: 20,
      iconSize: 12,
      paddingHorizontal: globalTokens.size40,
      textMargin: globalTokens.size20,
    },
    large: {
      minWidth: 24,
      minHeight: 24,
      iconSize: 16,
      paddingHorizontal: globalTokens.size40,
      textMargin: globalTokens.size20,
    },
    extraLarge: {
      minWidth: 32,
      minHeight: 32,
      iconSize: 20,
      paddingHorizontal: globalTokens.size60,
      textMargin: globalTokens.size20,
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
    rtl: {
      left: globalTokens.sizeNone,
      right: undefined,
    },
  } as BadgeTokens);
