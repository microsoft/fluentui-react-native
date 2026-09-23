import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { themedStyleSheetFactory, type ThemeState } from '@fluentui-react-native/design';

export type SkeletonThemeStyles = {
  root: ViewStyle;
};

export const skeletonStyles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerContainer: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
  },
});

export const getSkeletonThemeStyles = themedStyleSheetFactory<SkeletonThemeStyles>('Skeleton', ({ tokens }: ThemeState) => {
  const opaqueHighlight = typeof tokens.color.backgroundNeutralSubtle !== 'string';
  return StyleSheet.create({
    root: {
      backgroundColor: tokens.color.backgroundNeutralSoft,
      borderRadius: tokens.borderRadius.base100,
      ...(opaqueHighlight ? { borderColor: tokens.color.strokeNeutralLoud, borderWidth: Number(tokens.strokeWidth.thin) } : {}),
    },
  });
});
