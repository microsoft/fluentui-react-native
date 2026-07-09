import type { TokenSettings } from '@fluentui-react-native/framework';
import { cornerRadiusCircular } from '@fluentui-react-native/design/tokens/global';

import type { CounterBadgeTokens } from './CounterBadge.types';

export const counterBadgeTokens: TokenSettings<CounterBadgeTokens> = () =>
  ({
    shadowToken: undefined,
    dot: {
      width: 6,
      minHeight: 6,
      paddingHorizontal: 0,
      borderWidth: 0,
      borderRadius: cornerRadiusCircular,
    },
  }) as CounterBadgeTokens;
