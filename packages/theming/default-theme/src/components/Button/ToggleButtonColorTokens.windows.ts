import { PlatformColor } from 'react-native';

import type { Theme } from '@fluentui-react-native/theme-types';
import { isHighContrast } from '@fluentui-react-native/theming-utils';

export const defaultToggleButtonColorTokens = (t: Theme) => {
  if (isHighContrast(t)) {
    return highContrastColors;
  }

  return {
    checked: {
      color: t.colors.neutralForeground1Selected,
      backgroundColor: t.colors.neutralBackground1Selected,
      borderColor: t.colors.neutralStroke1,
      primary: {
        color: t.colors.neutralForegroundOnBrandSelected,
        backgroundColor: t.colors.brandBackgroundSelected,
        borderColor: t.colors.brandBackgroundSelected,
      },
      subtle: {
        color: t.colors.neutralForeground1Selected,
        backgroundColor: t.colors.subtleBackgroundSelected,
        borderColor: t.colors.subtleBackgroundSelected,
      },
    },
  };
};

const highContrastColors = {
  checked: {
    backgroundColor: PlatformColor('SystemColorHighlightColor'),
    borderColor: PlatformColor('SystemColorHighlightColor'),
    color: PlatformColor('SystemColorHighlightTextColor'),
    iconColor: PlatformColor('SystemColorHighlightTextColor'),
  },
};
