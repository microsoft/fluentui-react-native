import { checkboxName, CheckboxTokens, CheckboxSlotProps, CheckboxProps } from './Checkbox.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultCheckboxTokens } from './CheckboxTokens';

export const checkboxStates: (keyof CheckboxTokens)[] = [
  'labelIsBefore',
  'smallerMargins',
  'circular',
  'hovered',
  'focused',
  'pressed',
  'checked',
  'disabled',
];

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
          alignSelf: 'flex-start',
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          padding: tokens.padding,
        },
      }),
      ['backgroundColor', 'padding', ...borderStyles.keys],
    ),
    label: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          marginTop: -2,
          marginBottom: -2,
          marginLeft: tokens.spacingLabelAfter,
          marginRight: tokens.spacingLabelBefore,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['spacingLabelAfter', 'spacingLabelBefore', 'color', ...fontStyles.keys],
    ),
    checkbox: buildProps(
      (tokens: CheckboxTokens) => ({
        style: {
          height: tokens.checkboxSize,
          width: tokens.checkboxSize,
          backgroundColor: tokens.checkboxBackgroundColor,
          borderColor: tokens.checkboxBorderColor,
          borderRadius: tokens.checkboxBorderRadius,
          borderWidth: tokens.checkboxBorderWidth,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
      ['checkboxBackgroundColor', 'checkboxBorderColor', 'checkboxBorderRadius', 'checkboxBorderWidth', 'checkboxSize'],
    ),
    checkmark: buildProps(
      (tokens: CheckboxTokens) => ({
        style: {
          width: 10,
          height: 10,
          color: tokens.checkmarkColor,
          opacity: tokens.checkmarkOpacity,
        },
      }),
      ['checkmarkColor', 'checkmarkOpacity'],
    ),
  },
};
