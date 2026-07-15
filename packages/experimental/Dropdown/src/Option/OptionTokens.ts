import type { Theme, TokenSettings } from '@fluentui-react-native/framework';
import { cornerRadius40, size40, size60 } from '@fluentui-react-native/design/tokens/global';

import type { OptionTokens } from './Option.types';

export const defaultOptionTokens: TokenSettings<OptionTokens> = (t: Theme): OptionTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: cornerRadius40,
  checkmarkColor: t.colors.neutralForeground2,
  checkmarkSize: 16,
  color: t.colors.neutralForeground2,
  minHeight: 32,
  minWidth: 160,
  maxWidth: 300,
  paddingHorizontal: size60,
  spacingContentIcon: size40,
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
