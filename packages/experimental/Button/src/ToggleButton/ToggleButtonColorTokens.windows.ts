import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ToggleButtonTokens } from './ToggleButton.types';

export const defaultToggleButtonColorTokens: TokenSettings<ToggleButtonTokens, Theme> = (t: Theme): ToggleButtonTokens => ({
  checked: {
    color: t.colors.neutralForeground1Selected,
    backgroundColor: t.colors.neutralBackground1Selected,
    hovered: {
      color: t.colors.neutralForeground1Hover,
      backgroundColor: t.colors.neutralBackground1Hover,
    },
    subtle: {
      color: t.colors.neutralForeground1Selected,
      backgroundColor: t.colors.neutralBackground1Selected,
      hovered: {
        color: t.colors.neutralForeground1Hover,
        backgroundColor: t.colors.neutralBackground1Hover,
        borderColor: t.colors.neutralStroke1,
      },
    },
  },
});
