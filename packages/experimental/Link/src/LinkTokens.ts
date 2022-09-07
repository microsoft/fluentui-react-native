import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { LinkTokens } from './Link.types';

export const defaultLinkTokens: TokenSettings<LinkTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.link,
    variant: 'body1',
    underline: true,
    disabled: {
      color: t.colors.disabledBodyText,
    },
    hovered: {
      color: t.colors.linkHovered,
    },
    pressed: {
      color: t.colors.linkPressed,
    },
    focused: {
      borderColor: t.colors.link,
      color: t.colors.linkHovered,
    },
    inline: {
      underline: false,
    },
    subtle: {
      color: t.colors.neutralForeground2,
      disabled: {
        color: t.colors.ghostDisabledContent,
      },
      hovered: {
        color: t.colors.neutralForeground2,
      },
      pressed: {
        color: t.colors.neutralForeground2,
      },
      focused: {
        borderColor: t.colors.ghostFocusedBorder,
        color: t.colors.neutralForeground2,
      },
    },
  } as LinkTokens);

