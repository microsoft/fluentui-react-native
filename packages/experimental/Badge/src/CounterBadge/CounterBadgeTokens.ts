import { TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { CounterBadgeTokens } from './CounterBadge.types';

export const counterBadgeTokens: TokenSettings<CounterBadgeTokens> = () =>
  ({
    dot: {
      width: 6,
      minHeight: 6,
      paddingHorizontal: 0,
      borderWidth: 0,
      borderRadius: globalTokens.corner.radius.circle,
    },
  } as CounterBadgeTokens);
