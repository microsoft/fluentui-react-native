import { buttonName, ButtonTokens, ButtonSlotProps, ButtonProps } from './Button.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles } from '@fluentui-react-native/tokens';
import { defaultButtonTokens } from './ButtonTokens';

export const buttonStates: (keyof ButtonTokens)[] = ['fab', 'fluid', 'primary', 'subtle', 'hovered', 'focused', 'pressed', 'disabled'];

export const stylingSettings: UseStylingOptions<ButtonProps, ButtonSlotProps, ButtonTokens> = {
  tokens: [defaultButtonTokens, buttonName],
  states: buttonStates,
  tokensThatAreAlsoProps: ['color', 'variant'],
  slotProps: {
    root: buildProps(
      (tokens: ButtonTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          width: tokens.width,
          paddingStart: 16,
          paddingEnd: 16,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
          ...shadowStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'width', ...borderStyles.keys, ...layoutStyles.keys, ...shadowStyles.keys],
    ),
    content: buildProps(
      (tokens: ButtonTokens, theme: Theme, props: ButtonProps) => ({
        style: {
          color: props.color || tokens.color,
          ...fontStyles.from(tokens, theme),
          variant: props.variant || tokens.variant,
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: ButtonTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
      }),
      ['iconColor'],
    ),
  },
};
