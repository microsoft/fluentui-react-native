import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultMenuItemRadioTokens } from './MenuItemRadioTokens';
import { menuItemRadioName, MenuItemRadioProps, MenuItemRadioTokens, MenuItemRadioSlotProps } from './MenuItemRadio.types';

export const menuItemRadioStates: (keyof MenuItemRadioTokens)[] = ['hovered', 'focused', 'pressed', 'disabled', 'checked'];

export const stylingSettings: UseStylingOptions<MenuItemRadioProps, MenuItemRadioSlotProps, MenuItemRadioTokens> = {
  tokens: [defaultMenuItemRadioTokens, menuItemRadioName],
  states: menuItemRadioStates,
  slotProps: {
    root: buildProps(
      (tokens: MenuItemRadioTokens, theme: Theme) => ({
        style: {
          alignItems: 'center',
          backgroundColor: tokens.backgroundColor,
          display: 'flex',
          flexDirection: 'row',
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...layoutStyles.keys],
    ),
    checkmark: buildProps(
      (tokens: MenuItemRadioTokens) => ({
        opacity: tokens.checkmarkVisibility,
        color: tokens.color,
        height: tokens.checkmarkSize,
        width: tokens.checkmarkSize,
        viewBox: '0 0 ' + (tokens.checkmarkSize - tokens.checkmarkPadding * 2) + ' ' + (tokens.checkmarkSize - tokens.checkmarkPadding * 2),
        style: { marginEnd: tokens.gap },
      }),
      ['checkmarkSize', 'gap', 'color'],
    ),
    content: buildProps(
      (tokens: MenuItemRadioTokens, theme: Theme) => ({
        style: {
          flexGrow: 1,
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
  },
};
