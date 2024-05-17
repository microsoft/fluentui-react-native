import type { Theme } from '@fluentui-react-native/framework';

export const defaultButtonFontTokens = (_t: Theme) =>
  ({
    medium: {
      hasContent: {
        variant: 'bodyStandard',
      },
    },
    small: {
      hasContent: {
        variant: 'secondaryStandard',
      },
    },
    large: {
      variant: 'subheaderSemibold',
    },
  });
