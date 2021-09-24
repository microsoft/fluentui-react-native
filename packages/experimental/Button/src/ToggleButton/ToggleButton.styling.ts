import { toggleButtonName, ToggleButtonTokens, ToggleButtonSlotProps, ToggleButtonProps } from './ToggleButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultButtonColorTokens } from '../ButtonColorTokens';
import { buttonStates } from '../Button.styling';
import { defaultToggleButtonColorTokens } from './ToggleButtonColorTokens';
import { defaultButtonTokens } from '../ButtonTokens';

export const stylingSettings: UseStylingOptions<ToggleButtonProps, ToggleButtonSlotProps, ToggleButtonTokens> = {
  tokens: [defaultButtonTokens, defaultButtonColorTokens, defaultToggleButtonColorTokens, toggleButtonName],
  states: ['checked', ...buttonStates],
  slotProps: {
    root: buildProps(
      (tokens: ToggleButtonTokens, theme: Theme) => ({
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
        },
      }),
      ['backgroundColor', 'width', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    content: buildProps(
      (tokens: ToggleButtonTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          marginLeft: tokens.spacingIconContent,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', 'spacingIconContent', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: ToggleButtonTokens) => ({
        style: {
          tintColor: tokens.iconColor,
          margin: 2,
        },
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
  },
};
