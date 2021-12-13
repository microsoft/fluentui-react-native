import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonTokens: TokenSettings<CompoundButtonTokens, Theme> = (): CompoundButtonTokens => ({
  small: {
    padding: globalTokens.spacing.s - globalTokens.stroke.width.thin,
    hasContent: {
      paddingHorizontal: globalTokens.spacing.s - globalTokens.stroke.width.thin,
      minWidth: 64,
      variant: 'bodyStandard',
      secondaryContentFont: { variant: 'secondaryStandard' },
    },
  },
  medium: {
    padding: globalTokens.spacing.m - globalTokens.stroke.width.thin,
    hasContent: {
      paddingHorizontal: globalTokens.spacing.m - globalTokens.stroke.width.thin,
      minWidth: 96,
      variant: 'bodySemibold',
      secondaryContentFont: { variant: 'secondaryStandard' },
    },
  },
  large: {
    padding: globalTokens.spacing.l - globalTokens.stroke.width.thin,
    hasContent: {
      paddingHorizontal: globalTokens.spacing.l - globalTokens.stroke.width.thin,
      minWidth: 96,
      variant: 'subheaderSemibold',
      secondaryContentFont: { variant: 'bodyStandard' },
    },
  },
});
