import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, shadowStyles, fontStyles } from '@fluentui-react-native/tokens';
import { menuButtonName, MenuButtonProps, MenuButtonSlotProps, MenuButtonTokens } from './MenuButton.types';
import { defaultButtonTokens, buttonStates } from '@fluentui-react-native/experimental-button';

export const stylingSettings: UseStylingOptions<MenuButtonProps, MenuButtonSlotProps, MenuButtonTokens> = {
  tokens: [menuButtonName, defaultButtonTokens],
  states: buttonStates,
  tokensThatAreAlsoProps: ['color', 'variant'],
  slotProps: {
    button: buildProps(
      (tokens: MenuButtonTokens, theme: Theme, props: MenuButtonProps) => {
        const { onClick, primary, componentRef, icon, tooltip } = props;
        return {
          style: {
            backgroundColor: tokens.backgroundColor,
            ...borderStyles.from(tokens, theme),
            ...layoutStyles.from(tokens, theme),
            ...shadowStyles.from(tokens, theme),
            ...fontStyles.from(tokens, theme),
          },
          color: tokens.color,
          variant: tokens.variant,
          onClick,
          primary,
          componentRef,
          icon,
          tooltip,
        };
      },
      [
        'backgroundColor',
        'color',
        'iconColor',
        ...borderStyles.keys,
        ...layoutStyles.keys,
        ...shadowStyles.keys,
        ...fontStyles.keys,
        'onClick',
        'primary',
        'componentRef',
        'icon',
        'tooltip',
      ],
    ),
  },
};
