import { buttonName, ButtonTokens, ButtonSlotProps, ButtonProps } from './Button.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles } from '@fluentui-react-native/tokens';
import { defaultButtonSpacingTokens } from './ButtonSpacingTokens';
import { defaultButtonTokens } from './ButtonTokens';

export const buttonStates: (keyof ButtonTokens)[] = [
  'fab',
  'fluid',
  'primary',
  'subtle',
  'hovered',
  'focused',
  'pressed',
  'disabled',
  'small',
  'medium',
  'large',
  'hasContent',
  'hasIcon',
];

export const stylingSettings: UseStylingOptions<ButtonProps, ButtonSlotProps, ButtonTokens> = {
  tokens: [defaultButtonSpacingTokens, defaultButtonTokens, buttonName],
  states: buttonStates,
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
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
          ...shadowStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'width', ...borderStyles.keys, ...layoutStyles.keys, ...shadowStyles.keys],
    ),
    content: buildProps(
      (tokens: ButtonTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          marginLeft: tokens.spacingIconContent,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', 'spacingIconContent', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: ButtonTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
  },
};
