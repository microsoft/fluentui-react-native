import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonCoreTokens } from '../Button.types';

export const defaultFABColorTokens: TokenSettings<ButtonCoreTokens, Theme> = (t: Theme): ButtonCoreTokens => ({
  // coloring same as primary
  backgroundColor: t.colors.brandedBackground,
  color: t.colors.brandedContent,
  borderColor: t.colors.brandedBorder,
  iconColor: t.colors.brandedIcon,
  disabled: {
    backgroundColor: t.colors.brandedDisabledBackground,
    color: t.colors.brandedDisabledContent,
    borderColor: t.colors.brandedDisabledBorder,
    iconColor: t.colors.brandedDisabledIcon,
  },
  hovered: {
    backgroundColor: t.colors.brandedHoveredBackground,
    color: t.colors.brandedHoveredContent,
    borderColor: t.colors.brandedHoveredBorder,
    iconColor: t.colors.brandedHoveredIcon,
  },
  pressed: {
    backgroundColor: t.colors.brandedPressedBackground,
    color: t.colors.brandedPressedContent,
    borderColor: t.colors.brandedPressedBorder,
    iconColor: t.colors.brandedPressedIcon,
  },
  focused: {
    backgroundColor: t.colors.brandedFocusedBackground,
    color: t.colors.brandedFocusedContent,
    borderColor: t.colors.brandedFocusedBorder,
    iconColor: t.colors.brandedFocusedIcon,
  },
});
