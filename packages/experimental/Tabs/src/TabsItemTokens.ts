import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { TabsItemTokens } from '.';

export const tabsItemStates: (keyof TabsItemTokens)[] = ['hovered', 'focused', 'pressed', 'disabled'];

export const defaultTabsItemTokens: TokenSettings<TabsItemTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: 'green',
    color: t.colors.buttonText,
    borderColor: 'red',
    iconColor: t.colors.buttonIcon,
    minHeight: 32,
    minWidth: 80,
    borderWidth: 1,
    borderRadius: 2,

    disabled: {
      backgroundColor: t.colors.buttonDisabledBackground,
      color: t.colors.buttonDisabledContent,
      borderColor: t.colors.buttonDisabledBorder,
      iconColor: t.colors.buttonDisabledIcon,
    },
    hovered: {
      backgroundColor: t.colors.buttonHoveredBackground,
      color: t.colors.buttonHoveredContent,
      borderColor: t.colors.buttonHoveredBorder,
      iconColor: t.colors.buttonHoveredIcon,
    },
    pressed: {
      backgroundColor: 'blue',
      color: t.colors.buttonPressedContent,
      borderColor: t.colors.buttonPressedBorder,
      iconColor: t.colors.buttonPressedIcon,
    },
    focused: {
      backgroundColor: 'blue',
      color: t.colors.buttonFocusedContent,
      borderColor: t.colors.buttonFocusedBorder,
      icon: t.colors.buttonFocusedIcon,
    },
  } as TabsItemTokens);
