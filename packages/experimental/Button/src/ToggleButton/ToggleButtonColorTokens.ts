import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ToggleButtonTokens } from './ToggleButton.types';

export const defaultToggleButtonColorTokens: TokenSettings<ToggleButtonTokens, Theme> = (t: Theme): ToggleButtonTokens => ({
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
