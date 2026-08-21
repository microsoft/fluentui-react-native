import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { themedStyleSheetFactory, type ThemeState } from '@fluentui-react-native/design';

export type SkeletonThemeStyles = {
  root: ViewStyle;
  shimmerBand: ViewStyle;
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
  shimmerBand: {
    height: '100%',
    opacity: 0.64,
  },
});

export const getSkeletonThemeStyles = themedStyleSheetFactory<SkeletonThemeStyles>('Skeleton', ({ tokens }: ThemeState) =>
  StyleSheet.create({
    root: {
      backgroundColor: tokens.color.backgroundNeutralSubtle,
      borderRadius: tokens.borderRadius.base100,
    },
    shimmerBand: {
      backgroundColor: tokens.color.backgroundNeutralSoft,
      borderRadius: tokens.borderRadius.base100,
    },
  }),
);
