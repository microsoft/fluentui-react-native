import { ButtonTokens } from '../Button.types';
import { TokenSettings } from '@fluentui-react-native/experimental-framework';

export const settings: TokenSettings<ButtonTokens>[] = [
  t => ({
    backgroundColor: t.colors.menuBackground,
    color: t.colors.menuItemText,
    borderColor: t.colors.menuBackground,
    disabled: {
      color: t.colors.disabledBodyText,
      borderColor: t.colors.menuBackground,
      backgroundColor: t.colors.background
    },
    hovered: {
      backgroundColor: t.colors.menuItemBackgroundHovered,
      color: t.colors.menuItemTextHovered,
      borderColor: t.colors.menuItemBackgroundHovered
    },
    pressed: {
      backgroundColor: t.colors.menuItemBackgroundPressed,
      borderColor: t.colors.menuItemBackgroundPressed
    },
    focused: {
      borderColor: t.colors.focusBorder,
      backgroundColor: t.colors.menuItemBackgroundHovered,
      color: t.colors.menuItemTextHovered
    }
  }),
  'PrimaryButton'
];
