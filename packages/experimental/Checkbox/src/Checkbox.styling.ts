import { checkboxName, CheckboxTokens, CheckboxSlotProps, CheckboxProps, CheckboxSize } from './Checkbox.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultCheckboxTokens } from './CheckboxTokens';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';

export const checkboxStates: (keyof CheckboxTokens)[] = [
  'medium',
  'large',
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
          padding: tokens.padding,
          paddingHorizontal: tokens.paddingHorizontal,
        },
      }),
      ['backgroundColor', 'padding', ...borderStyles.keys],
    ),
    label: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: contentStyling(tokens, theme),
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
          width: tokens.checkmarkSize,
          height: tokens.checkmarkSize,
          color: tokens.checkmarkColor,
          opacity: tokens.checkmarkOpacity,
        },
      }),
      ['checkmarkColor', 'checkmarkSize', 'checkmarkOpacity'],
    ),
  },
};

export const getDefaultSize = (): CheckboxSize => {
  return 'medium';
};

const contentStyling = (tokens: CheckboxTokens, theme: Theme) => {
  const textAdjustment = getTextMarginAdjustment();
  const spacingLabelAfter = tokens.spacingLabelAfter
    ? {
        marginStart: textAdjustment.marginStart + tokens.spacingLabelAfter,
      }
    : {};
  const spacingLabelBefore = tokens.spacingLabelBefore
    ? {
        marginEnd: textAdjustment.marginEnd + tokens.spacingLabelBefore,
      }
    : {};
  return {
    color: tokens.color,
    ...spacingLabelBefore,
    ...spacingLabelAfter,
    ...fontStyles.from(tokens, theme),
  };
};
