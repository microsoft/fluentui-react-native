import type { Theme } from '@fluentui-react-native/framework';

type fontVariantType = 'secondaryStandard' | 'bodyStandard';

export const defaultButtonFontTokens = (_t: Theme) =>
  ({
    medium: {
      hasContent: {
        variant: 'bodySemibold' as fontVariantType,
      },
    },
    small: {
      hasContent: {
        variant: 'secondaryStandard' as fontVariantType,
      },
    },
    large: {
      variant: 'subheaderSemibold' as fontVariantType,
    },
  });
