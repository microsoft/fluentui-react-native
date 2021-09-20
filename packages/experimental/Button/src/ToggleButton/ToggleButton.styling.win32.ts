import { toggleButtonName, ToggleButtonTokens, ToggleButtonSlotProps, ToggleButtonProps } from './ToggleButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultButtonTokens } from '../ButtonTokens';
import { buttonStates } from '../Button.styling';

export const stylingSettings: UseStylingOptions<ToggleButtonProps, ToggleButtonSlotProps, ToggleButtonTokens> = {
  tokens: [
    defaultButtonTokens,
    (t: Theme): ToggleButtonTokens => ({
      checked: {
        color: t.colors.neutralForeground1,
        backgroundColor: t.colors.neutralBackground1Selected,
        hovered: {
          color: t.colors.neutralForeground1,
          backgroundColor: t.colors.neutralBackground1Hover,
        },
        subtle: {
          color: t.colors.neutralForeground1,
          backgroundColor: t.colors.neutralBackground1Selected,
          hovered: {
            color: t.colors.neutralForeground1,
            backgroundColor: t.colors.neutralBackground1Hover,
            borderColor: t.colors.neutralStroke1,
          },
        },
      },
    }),
    toggleButtonName,
  ],
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
          minHeight: 24,
          width: tokens.width,
          paddingStart: 16,
          paddingEnd: 16,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys],
    ),
    content: buildProps(
      (tokens: ToggleButtonTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: ToggleButtonTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
      }),
      ['iconColor'],
    ),
  },
};
