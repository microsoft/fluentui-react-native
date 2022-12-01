import { Theme, TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { OptionTokens } from './Option.types';

export const defaultOptionTokens: TokenSettings<OptionTokens> = (t: Theme): OptionTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radius40,
  checkmarkColor: t.colors.neutralForeground2,
  checkmarkSize: 16,
  color: t.colors.neutralForeground2,
  minHeight: 32,
  minWidth: 160,
  maxWidth: 300,
  paddingHorizontal: globalTokens.size60,
  spacingContentIcon: globalTokens.size40,
  variant: 'body1',
  hovered: {
    backgroundColor: t.colors.neutralBackground1Hover,
    checkmarkColor: t.colors.neutralForeground2Hover,
    color: t.colors.neutralForeground2Hover,
  },
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    checkmarkColor: t.colors.neutralForeground2Pressed,
    color: t.colors.neutralForeground2Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    checkmarkColor: t.colors.neutralForegroundDisabled,
    color: t.colors.neutralForegroundDisabled,
  },
});
