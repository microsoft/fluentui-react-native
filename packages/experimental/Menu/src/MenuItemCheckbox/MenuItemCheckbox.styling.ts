import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultMenuItemCheckboxTokens } from './MenuItemCheckboxTokens';
import { menuItemCheckboxName, MenuItemCheckboxProps, MenuItemCheckboxTokens, MenuItemCheckboxSlotProps } from './MenuItemCheckbox.types';

export const menuItemCheckboxStates: (keyof MenuItemCheckboxTokens)[] = ['hovered', 'focused', 'pressed', 'disabled', 'checked'];

export const stylingSettings: UseStylingOptions<MenuItemCheckboxProps, MenuItemCheckboxSlotProps, MenuItemCheckboxTokens> = {
  tokens: [defaultMenuItemCheckboxTokens, menuItemCheckboxName],
  states: menuItemCheckboxStates,
  slotProps: {
    root: buildProps(
      (tokens: MenuItemCheckboxTokens, theme: Theme) => ({
        style: {
          alignItems: 'center',
          backgroundColor: tokens.backgroundColor,
          display: 'flex',
          flexDirection: 'row',
          ...layoutStyles.from(tokens, theme),
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...layoutStyles.keys],
    ),
    checkmark: buildProps(
      (tokens: MenuItemCheckboxTokens) => ({
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
      (tokens: MenuItemCheckboxTokens, theme: Theme) => ({
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
