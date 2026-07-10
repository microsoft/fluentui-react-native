import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius20,
  cornerRadius40,
  size20,
  size40,
  size80,
  sizeNone,
  strokeWidthNone,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ChipTokens } from './Chip.types';

export const defaultChipTokens: TokenSettings<ChipTokens, Theme> = () =>
  ({
    // Only small and medium are supported sizes on Android.
    // Medium is the default size.
    medium: {
      borderRadius: cornerRadius40,
      variant: 'body2',
      paddingHorizontal: size80,
      paddingVertical: size20,
      iconSize: 16,
      borderWidth: strokeWidthNone,
      bottom: sizeNone,
      right: sizeNone,
      position: 'relative',
      textMargin: size80,
    },
    small: {
      iconSize: 16, // Used when close icon is active.
      borderRadius: cornerRadius20,
      variant: 'caption1',
      paddingHorizontal: size40,
      paddingVertical: size20,
      borderWidth: strokeWidthNone,
      bottom: sizeNone,
      right: sizeNone,
      position: 'relative',
      textMargin: sizeNone,
      searchBar: {
        borderRadius: cornerRadius40,
        variant: 'body2',
        paddingHorizontal: size80,
        paddingVertical: size20,
      },
    },
    rtl: {
      left: sizeNone,
      right: undefined,
    },
  }) as ChipTokens;
