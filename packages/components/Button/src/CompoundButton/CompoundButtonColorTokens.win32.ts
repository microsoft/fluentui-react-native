import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonColorTokens: TokenSettings<CompoundButtonTokens, Theme> = (t: Theme): CompoundButtonTokens => ({
  secondaryContentColor: t.colors.neutralForeground2,
  hovered: {
    secondaryContentColor: t.colors.neutralForeground2Hover,
  },
  focused: {
    secondaryContentColor: t.colors.neutralForeground2Hover,
  },
  pressed: {
    secondaryContentColor: t.colors.neutralForeground2Pressed,
  },
  primary: {
    secondaryContentColor: t.colors.neutralForegroundOnBrand,
    hovered: {
      secondaryContentColor: t.colors.neutralForegroundOnBrandHover,
    },
    focused: {
      secondaryContentColor: t.colors.neutralForegroundOnBrandHover,
    },
    pressed: {
      secondaryContentColor: t.colors.neutralForegroundOnBrandPressed,
    },
  },
  subtle: {
    secondaryContentColor: t.colors.neutralForeground2,
    hovered: {
      secondaryContentColor: t.colors.neutralForeground2Hover,
    },
    focused: {
      secondaryContentColor: t.colors.neutralForeground2Hover,
    },
    pressed: {
      secondaryContentColor: t.colors.neutralForeground2Pressed,
    },
  },
});
