import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonFontTokens: TokenSettings<CompoundButtonTokens, Theme> = (_t: Theme): CompoundButtonTokens => ({
  medium: {
    hasContent: {
      variant: 'bodySemibold',
      secondaryContentFont: { variant: 'secondaryStandard' },
    },
  },
  small: {
    hasContent: {
      variant: 'bodyStandard',
      secondaryContentFont: { variant: 'secondaryStandard' },
    },
  },
  large: {
    hasContent: {
      variant: 'subheaderSemibold',
      secondaryContentFont: { variant: 'bodyStandard' },
    },
  },
});
