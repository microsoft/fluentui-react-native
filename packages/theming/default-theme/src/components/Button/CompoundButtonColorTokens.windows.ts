import { PlatformColor } from 'react-native';

import type { Theme } from '@fluentui-react-native/theme-types';
import { isHighContrast } from '@fluentui-react-native/theming-utils';

export const defaultCompoundButtonColorTokens = (t: Theme) => {
  if (isHighContrast(t)) {
    return highContrastColors;
  }

  return {
    secondaryContentColor: t.colors.neutralForeground2,
    disabled: {
      secondaryContentColor: t.colors.neutralForegroundDisabled,
    },
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
  };
};

const highContrastColors = {
  secondaryContentColor: PlatformColor('SystemColorButtonTextColor'),
  disabled: {
    secondaryContentColor: PlatformColor('SystemColorGrayTextColor'),
  },
  hovered: {
    secondaryContentColor: PlatformColor('SystemColorHighlightTextColor'),
  },
  focused: {
    secondaryContentColor: PlatformColor('SystemColorHighlightTextColor'),
  },
  pressed: {
    secondaryContentColor: PlatformColor('SystemColorHighlightTextColor'),
  },
};
