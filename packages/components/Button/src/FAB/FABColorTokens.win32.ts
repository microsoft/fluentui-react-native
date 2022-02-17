import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonCoreTokens } from '../Button.types';
import { shadowStyleFromGlobalToken } from '../shadowStyle';

export const defaultFABColorTokens: TokenSettings<ButtonCoreTokens, Theme> = (t: Theme): ButtonCoreTokens => ({
  ...shadowStyleFromGlobalToken(8),
  // coloring same as primary
  backgroundColor: t.colors.brandBackground,
  color: t.colors.neutralForegroundOnBrand,
  borderColor: t.colors.brandStroke1,
  iconColor: t.colors.neutralForegroundOnBrand,
  disabled: {
    backgroundColor: t.colors.neutralBackgroundDisabled,
    color: t.colors.neutralForegroundDisabled,
    borderColor: t.colors.neutralStrokeDisabled,
    iconColor: t.colors.neutralForegroundDisabled,
  },
  hovered: {
    backgroundColor: t.colors.brandBackgroundHover,
    color: t.colors.neutralForegroundOnBrandHover,
    borderColor: t.colors.brandBackgroundHover,
    iconColor: t.colors.neutralForegroundOnBrandHover,
  },
  pressed: {
    backgroundColor: t.colors.brandBackgroundPressed,
    color: t.colors.neutralForegroundOnBrandPressed,
    borderColor: t.colors.brandBackgroundPressed,
    iconColor: t.colors.neutralForegroundOnBrandPressed,
  },
  focused: {
    backgroundColor: t.colors.brandBackgroundHover,
    color: t.colors.neutralForegroundOnBrandHover,
    borderColor: t.colors.strokeFocus2,
    iconColor: t.colors.neutralForegroundOnBrandHover,
  },
});
