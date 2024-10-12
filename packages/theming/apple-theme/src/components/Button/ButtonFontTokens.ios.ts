import type { Theme } from '@fluentui-react-native/theme-types';

export const defaultButtonFontTokens = (t: Theme) => ({
  medium: {
    fontSize: t.typography.variants.caption1Strong!.size,
    fontFamily: t.typography.variants.caption1Strong!.face,
    fontWeight: t.typography.variants.caption1Strong!.weight,
  },
  small: {
    fontSize: t.typography.variants.caption1Strong!.size,
    fontFamily: t.typography.variants.caption1Strong!.face,
    fontWeight: t.typography.variants.caption1Strong!.weight,
  },
  large: {
    fontSize: t.typography.variants.body1Strong!.size,
    fontFamily: t.typography.variants.body1Strong!.face,
    fontWeight: t.typography.variants.body1Strong!.weight,
  },
});
