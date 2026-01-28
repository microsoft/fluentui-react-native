import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import type { IBorderTokens } from '@fluentui-react-native/tokens';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';

import { linkName } from './Link.types';
import type { LinkState, LinkTokens, LinkSlotProps, LinkProps } from './Link.types';
import { defaultLinkTokens } from './LinkTokens';

export const linkStates: (keyof LinkState)[] = ['inline', 'subtle', 'hovered', 'focused', 'pressed', 'disabled'];

export const stylingSettings: UseStylingOptions<LinkProps, LinkSlotProps, LinkTokens> = {
  tokens: [defaultLinkTokens, linkName],
  states: linkStates,
  slotProps: {
    root: buildProps(
      (tokens: LinkTokens) => ({
        style: {
          alignSelf: tokens.alignSelf,
        },
      }),
      ['alignSelf'],
    ),
    content: buildProps(
      (tokens: LinkTokens, theme: Theme) => ({
        style: {
          alignSelf: tokens.alignSelf,
          textDecorationLine: tokens.textDecorationLine,
          color: tokens.color,
          fontStyle: tokens.fontStyle,
          textAlign: tokens.textAlign,
          ...fontStyles.from(tokens, theme),
          ...borderStyles.from(tokens as IBorderTokens, theme),
        },
        variant: tokens.variant,
      }),
      ['alignSelf', 'color', 'textDecorationLine', 'textAlign', ...fontStyles.keys, ...borderStyles.keys],
    ),
  },
};
