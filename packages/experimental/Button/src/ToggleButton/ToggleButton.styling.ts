import { toggleButtonName, ToggleButtonTokens, ToggleButtonSlotProps, ToggleButtonProps } from './ToggleButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { buttonStates, defaultButtonTokens } from '../ButtonTokens';

export const stylingSettings: UseStylingOptions<ToggleButtonProps, ToggleButtonSlotProps, ToggleButtonTokens> = {
  tokens: [
    defaultButtonTokens,
    (t: Theme) =>
      ({
        checked: {
          color: t.colors.buttonCheckedContent,
          backgroundColor: t.colors.buttonCheckedBackground,
          hovered: {
            color: t.colors.buttonCheckedHoveredContent,
            backgroundColor: t.colors.buttonCheckedHoveredBackground,
          },
          ghost: {
            color: t.colors.ghostCheckedContent,
            backgroundColor: t.colors.ghostCheckedBackground,
            hovered: {
              color: t.colors.ghostCheckedHoveredContent,
              backgroundColor: t.colors.ghostCheckedHoveredBackground,
              borderColor: t.colors.ghostCheckedHoveredBorder,
            },
          },
        },
      } as ToggleButtonTokens),
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
          minHeight: 32,
          minWidth: 80,
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
