import type { Theme } from '@fluentui-react-native/theme-types';

export const defaultButtonColorTokens = (t: Theme) => ({
  backgroundColor: t.colors.defaultBackground,
  color: t.colors.defaultContent,
  borderColor: t.colors.defaultBorder,
  iconColor: t.colors.defaultContent,
  disabled: {
    backgroundColor: t.colors.defaultDisabledBackground,
    color: t.colors.defaultDisabledContent,
    borderColor: t.colors.defaultDisabledBorder,
    iconColor: t.colors.defaultDisabledIcon,
  },
  hovered: {
    backgroundColor: t.colors.defaultBackground,
    color: t.colors.defaultContent,
    borderColor: t.colors.defaultBorder,
    iconColor: t.colors.defaultHoveredIcon,
  },
  pressed: {
    backgroundColor: t.colors.defaultPressedBackground,
    color: t.colors.defaultPressedContent,
    borderColor: t.colors.defaultBorder,
    iconColor: t.colors.defaultPressedIcon,
  },
  focused: {
    backgroundColor: t.colors.defaultFocusedBackground,
    color: t.colors.defaultFocusedContent,
    borderColor: t.colors.defaultFocusedBorder,
    icon: t.colors.defaultFocusedIcon,
  },
  primary: {
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
  },
  subtle: {
    backgroundColor: t.colors.ghostBackground,
    color: t.colors.ghostContent,
    borderColor: t.colors.ghostBorder,
    iconColor: t.colors.ghostIcon,
    disabled: {
      color: t.colors.ghostDisabledContent,
      borderColor: t.colors.ghostDisabledBorder,
      backgroundColor: t.colors.ghostDisabledBackground,
      iconColor: t.colors.ghostDisabledIcon,
    },
    hovered: {
      backgroundColor: t.colors.ghostHoveredBackground,
      color: t.colors.ghostHoveredContent,
      borderColor: t.colors.ghostHoveredBorder,
      iconColor: t.colors.ghostHoveredIcon,
    },
    pressed: {
      backgroundColor: t.colors.ghostPressedBackground,
      borderColor: t.colors.ghostPressedBorder,
      color: t.colors.ghostPressedContent,
      icon: t.colors.ghostPressedIcon,
    },
    focused: {
      borderColor: t.colors.ghostFocusedBorder,
      backgroundColor: t.colors.ghostFocusedBackground,
      color: t.colors.ghostFocusedContent,
      icon: t.colors.ghostFocusedIcon,
    },
  },
});
