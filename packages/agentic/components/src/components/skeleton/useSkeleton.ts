import * as React from 'react';
import { I18nManager, View } from 'react-native';
import type { LayoutRectangle } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useReducedMotion, useSharedAnimatedLoop, useSlot } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { skeletonStyles } from './skeleton.styles';
import type { SkeletonProps, SkeletonState } from './skeleton.types';

const animationDuration = 1700;

function createEmptyLayout(): LayoutRectangle {
  return { height: 0, width: 0, x: 0, y: 0 };
}

export function useSkeleton_unstable(props: SkeletonProps): SkeletonState {
  const { onLayout, style: userStyle, ...rest } = props;
  const themeState = useThemeState();
  const gradientId = `skeleton-gradient-${React.useId().replace(/:/g, '')}`;
  const highlightColor: unknown = themeState.tokens.color.backgroundNeutralSubtle;
  const shimmerColor = typeof highlightColor === 'string' ? highlightColor : undefined;
  const [layout, setLayout] = React.useState<LayoutRectangle>(createEmptyLayout);
  const reduceMotion = useReducedMotion() ?? false;
  const progress = useSharedAnimatedLoop({
    channel: 'agentic-components:skeleton',
    duration: animationDuration,
    enabled: !reduceMotion && shimmerColor !== undefined && layout.width > 0 && layout.height > 0,
    useNativeDriver: true,
  });

  React.useEffect(() => {
    if (__DEV__ && shimmerColor === undefined) {
      console.warn('Skeleton: rendering a static placeholder because native SVG gradients cannot use an opaque highlight color.');
    }
  }, [shimmerColor]);

  const handleLayout = React.useCallback(
    (event: Parameters<NonNullable<SkeletonProps['onLayout']>>[0]) => {
      onLayout?.(event);
      setLayout(event.nativeEvent.layout);
    },
    [onLayout],
  );

  const bandWidth = Math.max(Math.round(layout.width * 0.45), 24);
  // A 45-degree band spans its horizontal width plus the full placeholder height.
  const shimmerWidth = bandWidth + layout.height;
  const isRTL = I18nManager.isRTL;
  const translateX = React.useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: isRTL ? [layout.width, -shimmerWidth] : [-shimmerWidth, layout.width],
      }),
    [isRTL, layout.width, progress, shimmerWidth],
  );

  const root = useSlot(View, {
    ...rest,
    pointerEvents: rest.pointerEvents ?? 'none',
    ...hiddenFromAccessibilityProps,
    onLayout: handleLayout,
  });

  return {
    root,
    ...themeState,
    layout,
    reduceMotion,
    userStyle,
    bandWidth,
    gradientId,
    shimmerColor,
    shimmerWidth,
    translateX,
    shimmerContainerStyle: skeletonStyles.shimmerContainer,
    onLayout: handleLayout,
    progress,
  };
}
