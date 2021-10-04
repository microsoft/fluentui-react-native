import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, shadowStyles, fontStyles } from '@fluentui-react-native/tokens';
import { menuButtonName, MenuButtonProps, MenuButtonSlotProps, MenuButtonTokens } from './MenuButton.types';
import { defaultButtonTokens, buttonStates } from '@fluentui-react-native/experimental-button';

export const stylingSettings: UseStylingOptions<MenuButtonProps, MenuButtonSlotProps, MenuButtonTokens> = {
  tokens: [menuButtonName, defaultButtonTokens],
  states: buttonStates,
  slotProps: {
    button: buildProps(
      (tokens: MenuButtonTokens, theme: Theme, props: MenuButtonProps) => {
        const { onClick, primary, componentRef } = props;
        return {
          style: {
            backgroundColor: tokens.backgroundColor,
            color: tokens.color,
            iconColor: tokens.iconColor,
            ...borderStyles.from(tokens, theme),
            ...layoutStyles.from(tokens, theme),
            ...shadowStyles.from(tokens, theme),
            ...fontStyles.from(tokens, theme),
          },
          onClick,
          primary,
          componentRef,
        };
      },
      ['backgroundColor', 'color', 'iconColor', ...borderStyles.keys, ...layoutStyles.keys, ...shadowStyles.keys, ...fontStyles.keys],
    ),
  },
};
