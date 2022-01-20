import { toggleButtonName, ToggleButtonTokens, ToggleButtonSlotProps, ToggleButtonPropsWithInnerRef } from './ToggleButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultButtonColorTokens } from '../ButtonColorTokens';
import { buttonStates, contentStyling } from '../Button.styling';
import { defaultToggleButtonColorTokens } from './ToggleButtonColorTokens';
import { defaultButtonTokens } from '../ButtonTokens';
import { defaultButtonFontTokens } from '../ButtonFontTokens';

export const stylingSettings: UseStylingOptions<ToggleButtonPropsWithInnerRef, ToggleButtonSlotProps, ToggleButtonTokens> = {
  tokens: [defaultButtonTokens, defaultButtonFontTokens, defaultButtonColorTokens, defaultToggleButtonColorTokens, toggleButtonName],
  states: ['checked', ...buttonStates],
  slotProps: {
    root: buildProps(
      (tokens: ToggleButtonTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          width: tokens.width,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'width', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    content: buildProps(
      (tokens: ToggleButtonTokens, theme: Theme) => ({
        style: {
          ...contentStyling(tokens, theme, tokens.color, tokens),
        },
      }),
      ['color', 'spacingIconContentAfter', 'spacingIconContentBefore', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: ToggleButtonTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
  },
};
