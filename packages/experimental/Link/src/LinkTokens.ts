import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { LinkTokens } from './Link.types';

export const defaultLinkTokens: TokenSettings<LinkTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.brandForegroundLink,
    alignSelf: 'flex-start',
    variant: 'body1',
    inline: {
      textDecorationLine: 'underline',
    },
    disabled: {
      color: t.colors.neutralForegroundDisabled,
      textDecorationLine: 'none',
      focused: {
        borderColor: t.colors.strokeFocus2,
      },
    },
    hovered: {
      color: t.colors.brandForegroundLinkHover,
      textDecorationLine: 'underline',
    },
    pressed: {
      color: t.colors.brandForegroundLinkPressed,
    },
    visited: {
      color: t.colors.brandForegroundLink,
    },
    focused: {
      color: t.colors.brandForegroundLink,
      borderColor: t.colors.strokeFocus2,
    },
    subtle: {
      color: t.colors.neutralForeground2,
      hovered: {
        color: t.colors.neutralForeground2Hover,
      },
      pressed: {
        color: t.colors.neutralForeground2Pressed,
      },
      visited: {
        color: t.colors.neutralForeground2,
      },
      focused: {
        color: t.colors.neutralForeground2,
        borderColor: t.colors.strokeFocus2,
      },
    },
    brand: {
      color: t.colors.neutralForegroundInvertedLink,
      hovered: {
        color: t.colors.neutralForegroundInvertedLinkHover,
      },
      pressed: {
        color: t.colors.neutralForegroundInvertedLinkPressed,
      },
      visited: {
        color: t.colors.neutralForegroundInvertedLink,
      },
      focused: {
        color: t.colors.neutralForegroundInvertedLink,
        borderColor: t.colors.strokeFocus2,
      },
    },
  } as LinkTokens);
