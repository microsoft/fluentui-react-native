import { linkName, ILinkState, LinkTokens, LinkSlotProps, LinkProps } from './Link.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultLinkTokens } from './LinkTokens';

export const linkStates: (keyof ILinkState)[] = [
  'inline',
  'subtle',
  'hovered',
  'focused',
  'pressed',
  'disabled',
];

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
      [],
    ),
    content: buildProps(
      (tokens: LinkTokens, theme: Theme) => ({
        style: {
          alignSelf: tokens.alignSelf,
          textDecorationLine: tokens.textDecorationLine,
          color: tokens.color,
          fontStyle: tokens.fontStyle,
          textAlign: tokens.textAlign,
          variant: tokens.variant,
          ...fontStyles.from(tokens, theme),
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    )
  },
};
