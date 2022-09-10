import { Theme, TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { OptionTokens } from './Option.types';

export const defaultOptionTokens: TokenSettings<OptionTokens> = (t: Theme): OptionTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radius.medium,
  checkmarkColor: t.colors.neutralForeground2,
  checkmarkSize: 16,
  color: t.colors.neutralForeground2,
  minHeight: 32,
  minWidth: 160,
  maxWidth: 300,
  paddingHorizontal: globalTokens.spacing.sNudge,
  spacingContentIcon: globalTokens.spacing.xs,
  variant: 'body1',
});
