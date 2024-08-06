import type { Theme } from '@fluentui-react-native/theme-types';

export const defaultToggleButtonColorTokens = (t: Theme) => ({
  checked: {
    color: t.colors.defaultCheckedContent,
    backgroundColor: t.colors.defaultCheckedBackground,
    hovered: {
      color: t.colors.defaultCheckedHoveredContent,
      backgroundColor: t.colors.defaultCheckedHoveredBackground,
    },
    subtle: {
      color: t.colors.ghostCheckedContent,
      backgroundColor: t.colors.ghostCheckedBackground,
      hovered: {
        color: t.colors.ghostCheckedHoveredContent,
        backgroundColor: t.colors.ghostCheckedHoveredBackground,
        borderColor: t.colors.ghostCheckedHoveredBorder,
      },
    },
  },
});
