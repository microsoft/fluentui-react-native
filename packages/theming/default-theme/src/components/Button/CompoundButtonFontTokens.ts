import type { Theme } from '@fluentui-react-native/framework';

type fontVariantType = 'secondaryStandard' | 'bodyStandard';

export const defaultCompoundButtonFontTokens = (_t: Theme) => ({
  medium: {
    hasContent: {
      variant: 'bodySemibold' as fontVariantType,
      secondaryContentFont: { variant: 'secondaryStandard' as fontVariantType },
    },
  },
  small: {
    hasContent: {
      variant: 'bodyStandard' as fontVariantType,
      secondaryContentFont: { variant: 'secondaryStandard' as fontVariantType },
    },
  },
  large: {
    hasContent: {
      variant: 'subheaderSemibold' as fontVariantType,
      secondaryContentFont: { variant: 'bodyStandard' as fontVariantType },
    },
  },
});
