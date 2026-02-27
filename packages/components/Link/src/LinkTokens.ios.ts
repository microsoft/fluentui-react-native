import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { LinkTokens } from './Link.types';

export const defaultLinkTokens: TokenSettings<LinkTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.brandForeground1,
    alignSelf: 'flex-start',
    inline: {
      textDecorationLine: 'underline',
    },
    disabled: {
      color: t.colors.brandForeground1Disabled,
      textDecorationLine: 'none',
    },
    pressed: {
      color: t.colors.brandForeground1Pressed,
    },
  }) as LinkTokens;
