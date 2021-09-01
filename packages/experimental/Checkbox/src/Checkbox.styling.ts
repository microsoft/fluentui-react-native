import { checkboxName, CheckboxTokens, CheckboxSlotProps, CheckboxProps } from './Checkbox.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { checkboxStates, defaultCheckboxTokens } from './CheckboxTokens';

export const stylingSettings: UseStylingOptions<CheckboxProps, CheckboxSlotProps, CheckboxTokens> = {
  tokens: [defaultCheckboxTokens, checkboxName],
  states: checkboxStates,
  slotProps: {
    root: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          minHeight: 14,
          marginTop: 0,
          position: 'relative',
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys],
    ),
    content: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          borderColor: tokens.textBorderColor,
          borderStyle: 'solid',
          borderWidth: 2,
          marginTop: 3,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', 'textBorderColor', ...fontStyles.keys, ...borderStyles.keys],
    ),
    checkbox: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          borderStyle: 'solid',
          borderWidth: 1,
          minHeight: 14,
          minWidth: 14,
          marginEnd: 4,
          backgroundColor: tokens.checkboxBackgroundColor,
          borderColor: tokens.checkboxBorderColor,
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['checkboxBackgroundColor', 'checkboxBorderColor', ...borderStyles.keys],
    ),
    checkmark: buildProps(
      (tokens: CheckboxTokens) => ({
        style: {
          aspectRatio: 1,
          position: 'relative',
          fontSize: 10,
          textAlign: 'center',
          textAlignVertical: 'center',
          top: -1,
          color: tokens.checkmarkColor,
          opacity: tokens.checkmarkVisibility,
        },
      }),
      ['checkmarkColor', 'checkmarkVisibility'],
    ),
  },
};
