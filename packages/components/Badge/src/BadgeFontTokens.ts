import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { BadgeTokens } from './Badge.types';

export const badgeFontTokens: TokenSettings<BadgeTokens, Theme> = () =>
  ({
    variant: 'captionStandard',
    large: {
      variant: 'secondaryStandard',
    },
    extraLarge: {
      variant: 'secondaryStandard',
    },
  } as BadgeTokens);
