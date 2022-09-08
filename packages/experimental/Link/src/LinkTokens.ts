import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { LinkTokens } from './Link.types';

export const defaultLinkTokens: TokenSettings<LinkTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.link,
    variant: 'body1',
    inline: {
      textDecorationLine: 'underline',
    },
    disabled: {
      color: t.colors.disabledBodyText,
    },
    hovered: {
      color: t.colors.linkHovered,
    },
    pressed: {
      color: t.colors.linkPressed,
    },
    visited: {
      color: t.colors.link,
    },
    focused: {
      color: t.colors.link,
      borderColor: t.colors.focusBorder,
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
        borderColor: t.colors.focusBorder,
      }
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
        borderColor: t.colors.focusBorder,
      }
    }
  } as LinkTokens);

