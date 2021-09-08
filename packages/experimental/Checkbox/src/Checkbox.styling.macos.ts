import { checkboxName, CheckboxTokens, CheckboxSlotProps, CheckboxProps } from './Checkbox.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { checkboxStates, defaultCheckboxTokens } from './CheckboxTokens';

export const stylingSettings: UseStylingOptions<CheckboxProps, CheckboxSlotProps, CheckboxTokens> = {
  tokens: [defaultCheckboxTokens, checkboxName],
  states: checkboxStates,
  slotProps: {
    root: buildProps(
      (tokens: CheckboxTokens) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          minHeight: 20,
          marginTop: 0,
          position: 'relative',
          backgroundColor: tokens.backgroundColor,
        },
      }),
      ['backgroundColor'],
    ),
    content: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          borderStyle: 'solid',
          borderWidth: 1,
          marginTop: 3,
          color: tokens.color,
          borderColor: tokens.textBorderColor,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', 'textBorderColor', ...fontStyles.keys],
    ),
    checkbox: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          borderStyle: 'solid',
          borderWidth: 0.5,
          borderRadius: 3,
          minHeight: 14,
          minWidth: 14,
          marginEnd: tokens.checkboxMarginEnd,
          marginStart: tokens.checkboxMarginStart,
          backgroundColor: tokens.checkboxBackgroundColor,
          borderColor: tokens.checkboxBorderColor,
          opacity: tokens.checkboxVisibility,
          ...borderStyles.from(tokens, theme),
        },
      }),
      [
        'checkboxBackgroundColor',
        'checkboxBorderColor',
        'checkboxMarginStart',
        'checkboxMarginEnd',
        'checkboxVisibility',
        ...borderStyles.keys,
      ],
    ),
    checkmark: buildProps(
      (tokens: CheckboxTokens) => ({
        style: {
          position: 'relative',
          fontSize: 10,
          marginStart: 2,
          top: -1,
          color: tokens.checkmarkColor,
          opacity: tokens.checkmarkVisibility,
        },
      }),
      ['checkmarkColor', 'checkmarkVisibility'],
    ),
  },
};
