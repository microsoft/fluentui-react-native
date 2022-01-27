import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ToggleButtonTokens } from './ToggleButton.types';

export const defaultToggleButtonColorTokens: TokenSettings<ToggleButtonTokens, Theme> = (t: Theme): ToggleButtonTokens => ({
  checked: {
    color: t.colors.neutralForeground1Selected,
    backgroundColor: t.colors.neutralBackground1Selected,
    borderColor: t.colors.neutralStroke1,
    primary: {
      backgroundColor: t.colors.brandBackgroundSelected,
      borderColor: t.colors.brandBackgroundSelected,
      color: t.colors.neutralForeground1Selected,
    },
    subtle: {
      color: t.colors.neutralForeground1Selected,
      backgroundColor: t.colors.subtleBackgroundSelected,
      borderColor: t.colors.subtleBackgroundSelected,
    },
  },
});
