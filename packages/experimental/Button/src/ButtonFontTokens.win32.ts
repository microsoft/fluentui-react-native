import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from './Button.types';

export const defaultButtonFontTokens: TokenSettings<ButtonTokens, Theme> = (t: Theme) =>
  ({
    medium: {
      hasContent: {
        fontFamily: t.typography.families.secondary,
        fontSize: globalTokens.font.size[300],
        fontWeight: globalTokens.font.weight.semibold,
      },
    },
    small: {
      hasContent: {
        fontFamily: t.typography.families.primary,
        fontSize: globalTokens.font.size[200],
        fontWeight: globalTokens.font.weight.regular,
      },
    },
    large: {
      hasContent: {
        fontFamily: t.typography.families.secondary,
        fontSize: globalTokens.font.size[400],
        fontWeight: globalTokens.font.weight.semibold,
      },
    },
  } as ButtonTokens);
