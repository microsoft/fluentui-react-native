import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonColorTokens: TokenSettings<CompoundButtonTokens, Theme> = (t: Theme): CompoundButtonTokens => ({
  minHeight: 72,
  secondaryContentFont: {
    variant: 'secondaryStandard',
  },
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
