import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius20,
  cornerRadius40,
  cornerRadiusCircular,
  cornerRadiusNone,
  size20,
  size40,
  size60,
  sizeNone,
  strokeWidth10,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { BadgeTokens } from './Badge.types';

export const defaultBadgeTokens: TokenSettings<BadgeTokens, Theme> = () =>
  ({
    iconSize: 12,
    borderWidth: strokeWidth10,
    bottom: sizeNone,
    right: sizeNone,
    textMargin: size20,
    position: 'relative',
    shadowToken: undefined,
    tiny: {
      minWidth: 6,
      minHeight: 6,
      rounded: {
        borderRadius: cornerRadius20,
      },
    },
    extraSmall: {
      minWidth: 10,
      minHeight: 10,
      iconSize: 10,
      rounded: {
        borderRadius: cornerRadius20,
      },
    },
    small: {
      minWidth: 16,
      minHeight: 16,
      iconSize: 12,
      paddingHorizontal: size20,
      textMargin: size20,
      rounded: {
        borderRadius: cornerRadius20,
      },
    },
    medium: {
      minWidth: 20,
      minHeight: 20,
      iconSize: 12,
      paddingHorizontal: size40,
      textMargin: size20,
    },
    large: {
      minWidth: 24,
      minHeight: 24,
      iconSize: 16,
      paddingHorizontal: size40,
      textMargin: size20,
    },
    extraLarge: {
      minWidth: 32,
      minHeight: 32,
      iconSize: 20,
      paddingHorizontal: size60,
      textMargin: size20,
    },
    rounded: {
      borderRadius: cornerRadius40,
    },
    circular: {
      borderRadius: cornerRadiusCircular,
    },
    square: {
      borderRadius: cornerRadiusNone,
    },
    rtl: {
      left: sizeNone,
      right: undefined,
    },
  }) as BadgeTokens;
