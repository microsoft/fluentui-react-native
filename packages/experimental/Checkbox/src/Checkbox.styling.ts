import { checkboxName, CheckboxTokens, CheckboxSlotProps, CheckboxProps } from './Checkbox.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultCheckboxTokens } from './CheckboxTokens';

export const checkboxStates: (keyof CheckboxTokens)[] = [
  'labelIsBefore',
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
          padding: 4,
        },
      }),
      ['backgroundColor', ...borderStyles.keys],
    ),
    label: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          marginTop: -3,
          marginBottom: -1,
          marginLeft: tokens.spacingLabelAfter,
          marginRight: tokens.spacingLabelBefore,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['spacingLabelAfter', 'spacingLabelBefore', ...fontStyles.keys],
    ),
    checkbox: buildProps(
      (tokens: CheckboxTokens) => ({
        style: {
          minHeight: 16,
          minWidth: 16,
          backgroundColor: tokens.checkboxBackgroundColor,
          borderColor: tokens.checkboxBorderColor,
          borderRadius: tokens.checkboxBorderRadius,
          borderWidth: tokens.checkboxBorderWidth,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
      ['checkboxBackgroundColor', 'checkboxBorderColor', 'checkboxBorderRadius', 'checkboxBorderWidth', 'spacing'],
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
