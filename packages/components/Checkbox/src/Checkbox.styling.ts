import { Platform } from 'react-native';

import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';

import { checkboxName } from './Checkbox.types';
import type { CheckboxTokens, CheckboxSlotProps, CheckboxProps, CheckboxSize } from './Checkbox.types';
import { defaultCheckboxTokens } from './CheckboxTokens';

export const checkboxStates: (keyof CheckboxTokens)[] = [
  'medium',
  'large',
  'circular',
  'label',
  'labelIsBefore',
  'hovered',
  'focused',
  'pressed',
  'checked',
  'disabled',
];

const hasPresetRententionForA11y = Platform.OS === 'android';

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
          padding: tokens.padding,
          paddingHorizontal: tokens.paddingHorizontal,
          ...borderStyles.from(tokens, theme),
        },
        android_ripple: { color: tokens.rippleColor, foreground: true },
      }),
      ['backgroundColor', 'padding', ...borderStyles.keys, 'rippleColor'],
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
        ...(hasPresetRententionForA11y && {
          pressRetentionOffset:
            typeof tokens.padding === 'number' ? tokens.padding : typeof tokens.padding === 'string' ? parseFloat(tokens.padding) : 0, /// Retention of the press area outside of the checkbox equal to padding to match accessibility requirement
        }),
        android_ripple: { color: tokens.rippleColor, radius: tokens.checkmarkSize, foreground: true },
      }),
      ['checkboxBackgroundColor', 'checkboxBorderColor', 'checkboxBorderRadius', 'checkboxBorderWidth', 'checkboxSize', 'rippleColor'],
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
    required: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: { color: tokens.requiredColor, paddingStart: tokens.requiredPadding, ...fontStyles.from(tokens, theme) },
      }),
      ['requiredColor', 'requiredPadding', ...fontStyles.keys],
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
