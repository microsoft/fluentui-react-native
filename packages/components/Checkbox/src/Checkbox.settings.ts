import { checkboxName, CheckboxProps, CheckboxSlotProps, CheckboxTokens } from './Checkbox.types';

import { borderStyles, fontStyles, Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/use-styling';

export const checkboxSelectActionLabel = 'Toggle the Checkbox';

export const stylingSettings: UseStylingOptions<CheckboxProps, CheckboxSlotProps, CheckboxTokens> = {
  tokens: [
    (t) => ({
      /** base values for the checkbox */
      backgroundColor: t.colors.menuBackground,
      borderColor: t.colors.menuItemText,
      borderStyle: 'solid',
      borderWidth: 1,
      checkmarkVisibility: 0,
      checkmarkText: '✓',
      color: t.colors.menuItemText,
      textBorderColor: 'transparent',
      variant: 'bodyStandard',

      /** additional values for when the component is focused */
      focused: {
        backgroundColor: t.colors.menuItemBackgroundHovered,
        textBorderColor: t.colors.focusBorder,
      },
      /** additional values for when it is hovered */
      hovered: {
        backgroundColor: t.colors.menuItemBackgroundHovered,
      },
      /** override values for when the component is disabled */
      disabled: {
        borderColor: t.colors.buttonBorderDisabled,
        color: t.colors.disabledBodyText,
        backgroundColor: t.colors.background,
      },
      /** pressed state token values */
      pressed: {
        backgroundColor: t.colors.menuItemBackgroundPressed,
      },
      /** checked state token values */
      checked: {
        checkmarkVisibility: 1,
      },
    }),
    checkboxName,
  ],
  states: ['disabled', 'hovered', 'focused', 'pressed', 'checked'],
  slotProps: {
    root: buildProps(
      () => ({
        accessible: true,
        acceptsKeyboardFocus: true,
        accessibilityRole: 'checkbox',
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          minHeight: 14,
          marginTop: 0,
          position: 'relative',
        },
      }),
      [],
    ),
    checkbox: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          height: 14,
          width: 14,
          marginStart: tokens.boxSide === 'end' ? 4 : 0,
          marginEnd: tokens.boxSide === 'end' ? 0 : 4,
          backgroundColor: tokens.checkboxBackgroundColor || tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...(tokens.checkboxBorderColor && { borderColor: tokens.checkboxBorderColor }),
        },
      }),
      ['boxSide', 'backgroundColor', 'checkboxBorderColor', 'checkboxBackgroundColor', ...borderStyles.keys],
    ),
    checkmark: buildProps(
      (tokens: CheckboxTokens) => ({
        style: {
          position: 'relative',
          opacity: tokens.checkmarkVisibility,
          fontSize: 10,
          marginStart: 2,
          top: -1,
          color: tokens.checkmarkColor || tokens.color,
        },
      }),
      ['color', 'checkmarkVisibility', 'checkmarkColor'],
    ),
    content: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          borderStyle: 'dotted',
          borderWidth: 1,
          marginTop: 3,
          color: tokens.color,
          borderColor: tokens.textBorderColor,
          ...fontStyles.from(tokens, theme),
        },
      }),
      [...fontStyles.keys, 'color'],
    ),
  },
};
