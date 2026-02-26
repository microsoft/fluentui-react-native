import type { Theme, TokenSettings } from '@fluentui-react-native/framework';

import type { CounterBadgeTokens } from './CounterBadge.types';

export const defaultCounterBadgeColorTokens: TokenSettings<CounterBadgeTokens> = (t: Theme) =>
  ({
    backgroundColor: t.colors.dangerBackground2,
    color: t.colors.neutralForegroundLightStatic,
    borderColor: t.colors.strokeFocus1,
    dot: {
      backgroundColor: t.colors.dangerBackground2,
      color: t.colors.neutralForegroundLightStatic,
      borderColor: t.colors.strokeFocus1,
    },
    list: {
      backgroundColor: t.colors.dangerBackground2,
      color: t.colors.neutralForegroundLightStatic,
      borderColor: t.colors.strokeFocus1,
    },
  }) as CounterBadgeTokens;
