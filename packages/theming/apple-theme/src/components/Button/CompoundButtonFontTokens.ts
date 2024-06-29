import type { Theme } from '@fluentui-react-native/theme-types';

export const defaultCompoundButtonFontTokens = (_t: Theme) => ({
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
