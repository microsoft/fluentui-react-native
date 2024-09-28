import type { Theme } from '@fluentui-react-native/theme-types';

export const defaultCompoundButtonColorTokens = (t: Theme) => ({
  secondaryContentColor: t.colors.defaultSecondaryContent,
  hovered: {
    secondaryContentColor: t.colors.defaultHoveredSecondaryContent,
  },
  focused: {
    secondaryContentColor: t.colors.defaultFocusedSecondaryContent,
  },
  pressed: {
    secondaryContentColor: t.colors.defaultPressedSecondaryContent,
  },
  primary: {
    secondaryContentColor: t.colors.brandedSecondaryContent,
    hovered: {
      secondaryContentColor: t.colors.brandedHoveredSecondaryContent,
    },
    focused: {
      secondaryContentColor: t.colors.brandedFocusedSecondaryContent,
    },
    pressed: {
      secondaryContentColor: t.colors.brandedPressedSecondaryContent,
    },
  },
  subtle: {
    secondaryContentColor: t.colors.ghostSecondaryContent,
    hovered: {
      secondaryContentColor: t.colors.ghostHoveredSecondaryContent,
    },
    focused: {
      secondaryContentColor: t.colors.ghostFocusedSecondaryContent,
    },
    pressed: {
      secondaryContentColor: t.colors.ghostPressedSecondaryContent,
    },
  },
});
