import { checkboxName, CheckboxTokens, CheckboxSlotProps, CheckboxProps } from './Checkbox.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { checkboxStates, defaultCheckboxTokens } from './CheckboxTokens';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

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
          alignSelf: 'flex-start',
          backgroundColor: tokens.backgroundColor,
          borderColor: tokens.rootBorderColor,
          borderRadius: globalTokens.corner.radius.medium,
          borderWidth: globalTokens.stroke.width.thick,
          marginBottom: globalTokens.spacing.s,
        },
      }),
      ['backgroundColor', 'borderColor', 'borderRadius'],
    ),
    content: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          borderColor: tokens.textBorderColor,
          borderStyle: 'solid',
          marginTop: -1,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', 'textBorderColor', ...fontStyles.keys],
    ),
    checkbox: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        style: {
          minHeight: 16,
          minWidth: 16,
          marginEnd: tokens.checkboxMarginEnd,
          backgroundColor: tokens.checkboxBackgroundColor,
          borderColor: tokens.checkboxBorderColor,
          ...borderStyles.from(tokens, theme),
          marginLeft: tokens.marginLeft,
        },
      }),
      ['checkboxBackgroundColor', 'checkboxMarginEnd', 'marginLeft', ...borderStyles.keys],
    ),
    checkmark: buildProps(
      (tokens: CheckboxTokens) => ({
        style: {
          width: 11,
          height: 8,
          top: 3,
          left: 1,
          color: tokens.checkmarkColor,
          opacity: tokens.checkmarkOpacity,
        },
      }),
      ['checkmarkColor', 'checkmarkOpacity'],
    ),
  },
};
