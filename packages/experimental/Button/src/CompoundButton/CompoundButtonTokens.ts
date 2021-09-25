import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonTokens: TokenSettings<CompoundButtonTokens, Theme> = (): CompoundButtonTokens => ({
  small: {
    padding: globalTokens.spacing.s - 1,
    borderRadius: globalTokens.corner.radius.medium,
    hasContent: {
      paddingHorizontal: globalTokens.spacing.s - 1,
      minWidth: 64,
      variant: 'bodyStandard',
      secondaryContentFont: { variant: 'secondaryStandard' },
    },
  },
  medium: {
    padding: globalTokens.spacing.m - 1,
    hasContent: {
      paddingHorizontal: globalTokens.spacing.m - 1,
      minWidth: 96,
      variant: 'bodySemibold',
      secondaryContentFont: { variant: 'secondaryStandard' },
    },
  },
  large: {
    padding: globalTokens.spacing.l - 1,
    hasContent: {
      paddingHorizontal: globalTokens.spacing.l - 1,
      minWidth: 96,
      variant: 'subheaderSemibold',
      secondaryContentFont: { variant: 'bodyStandard' },
    },
  },
});
