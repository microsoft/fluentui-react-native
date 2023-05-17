import type { TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

import type { CounterBadgeTokens } from './CounterBadge.types';

export const counterBadgeTokens: TokenSettings<CounterBadgeTokens> = () =>
  ({
    variant: 'caption2',
    paddingHorizontal: globalTokens.size60,
    borderWidth: globalTokens.stroke.width20,
    borderRadius: globalTokens.corner.radius120,
    dot: {
      width: globalTokens.size80 + globalTokens.stroke.width20, // 8 is the size of the dot, 2 is the border width
      minHeight: globalTokens.size80 + globalTokens.stroke.width20,
      top: 3,
      left: 5,
      paddingHorizontal: 0,
      borderWidth: globalTokens.stroke.width20,
      borderRadius: globalTokens.corner.radiusCircular,
    },
    list: {
      variant: 'caption1Strong',
      paddingVertical: 3,
      paddingHorizontal: globalTokens.size80,
      borderWidth: globalTokens.stroke.width20,
      borderRadius: globalTokens.corner.radius120,
    },
  } as CounterBadgeTokens);
