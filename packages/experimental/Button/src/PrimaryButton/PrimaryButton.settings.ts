import { ButtonTokens } from '../Button.types';
import { TokenSettings } from '@fluentui-react-native/experimental-framework';

export const settings: TokenSettings<ButtonTokens>[] = [
  t => ({
    backgroundColor: t.colors.primaryButtonBackground,
    color: t.colors.primaryButtonText,
    borderColor: t.colors.primaryButtonBorder,
    disabled: {
      backgroundColor: t.colors.primaryButtonBackgroundDisabled,
      color: t.colors.primaryButtonTextDisabled,
      borderColor: t.colors.primaryButtonBackgroundDisabled
    },
    hovered: {
      backgroundColor: t.colors.primaryButtonBackgroundHovered,
      color: t.colors.primaryButtonTextHovered,
      borderColor: t.colors.primaryButtonBorderHovered as string
    },
    pressed: {
      backgroundColor: t.colors.primaryButtonBackgroundPressed,
      color: t.colors.primaryButtonTextPressed,
      borderColor: t.colors.primaryButtonBorderPressed as string
    },
    focused: {
      borderColor: t.colors.primaryButtonBorderFocused,
      backgroundColor: t.colors.primaryButtonBackgroundHovered,
      color: t.colors.primaryButtonTextHovered
    }
  }),
  'PrimaryButton'
];
