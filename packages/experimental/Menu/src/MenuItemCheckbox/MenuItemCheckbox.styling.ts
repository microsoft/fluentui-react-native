import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultMenuItemCheckboxTokens } from './MenuItemCheckboxTokens';
import { menuItemCheckboxName, MenuItemCheckboxProps, MenuItemCheckboxTokens, MenuItemCheckboxSlotProps } from './MenuItemCheckbox.types';

export const menuItemCheckboxStates: (keyof MenuItemCheckboxTokens)[] = ['hovered', 'focused', 'pressed', 'disabled'];

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
        },
      }),
      ['backgroundColor', ...layoutStyles.keys],
    ),
    content: buildProps(
      (tokens: MenuItemCheckboxTokens, theme: Theme) => {
        return {
          style: {
            flexGrow: 1,
            color: tokens.color,
            ...fontStyles.from(tokens, theme),
          },
        };
      },
      ['color', ...fontStyles.keys],
    ),
    submenuIndicator: buildProps(
      (tokens: MenuItemCheckboxTokens) => {
        return {
          color: tokens.color,
        };
      },
      ['color'],
    ),
  },
};
