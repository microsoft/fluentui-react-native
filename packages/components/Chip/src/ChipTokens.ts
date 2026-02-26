import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ChipTokens } from './Chip.types';

export const defaultChipTokens: TokenSettings<ChipTokens, Theme> = () =>
  ({
    // Only small and medium are supported sizes on Android.
    // Medium is the default size.
    medium: {
      borderRadius: globalTokens.corner.radius40,
      variant: 'body2',
      paddingHorizontal: globalTokens.size80,
      paddingVertical: globalTokens.size20,
      iconSize: 16,
      borderWidth: globalTokens.stroke.widthNone,
      bottom: globalTokens.sizeNone,
      right: globalTokens.sizeNone,
      position: 'relative',
      textMargin: globalTokens.size80,
    },
    small: {
      iconSize: 16, // Used when close icon is active.
      borderRadius: globalTokens.corner.radius20,
      variant: 'caption1',
      paddingHorizontal: globalTokens.size40,
      paddingVertical: globalTokens.size20,
      borderWidth: globalTokens.stroke.widthNone,
      bottom: globalTokens.sizeNone,
      right: globalTokens.sizeNone,
      position: 'relative',
      textMargin: globalTokens.sizeNone,
      searchBar: {
        borderRadius: globalTokens.corner.radius40,
        variant: 'body2',
        paddingHorizontal: globalTokens.size80,
        paddingVertical: globalTokens.size20,
      },
    },
    rtl: {
      left: globalTokens.sizeNone,
      right: undefined,
    },
  }) as ChipTokens;
