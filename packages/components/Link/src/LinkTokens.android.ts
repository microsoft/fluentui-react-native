import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { LinkTokens } from './Link.types';

export const defaultLinkTokens: TokenSettings<LinkTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.brandForeground1,
    alignSelf: 'flex-start',
    variant: 'caption1Strong',
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
  } as LinkTokens);
