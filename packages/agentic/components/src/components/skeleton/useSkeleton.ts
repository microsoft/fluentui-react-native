import * as React from 'react';
import { View } from 'react-native';
import type { LayoutRectangle } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useReducedMotion, useSharedAnimatedLoop, useSlot } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { skeletonStyles, getSkeletonThemeStyles } from './skeleton.styles';
import type { SkeletonProps, SkeletonState } from './skeleton.types';

const animationDuration = 1700;

function createEmptyLayout(): LayoutRectangle {
  return { height: 0, width: 0, x: 0, y: 0 };
}

export function useSkeleton_unstable(props: SkeletonProps): SkeletonState {
  const { onLayout, style: userStyle, ...rest } = props;
  const themeState = useThemeState();
  const [layout, setLayout] = React.useState<LayoutRectangle>(createEmptyLayout);
  const reduceMotion = useReducedMotion() ?? false;
  const progress = useSharedAnimatedLoop({
    channel: 'agentic-components:skeleton',
    duration: animationDuration,
    enabled: !reduceMotion && layout.width > 0 && layout.height > 0,
    useNativeDriver: true,
  });
  const themeStyles = getSkeletonThemeStyles(themeState);

  const handleLayout = React.useCallback(
    (event: Parameters<NonNullable<SkeletonProps['onLayout']>>[0]) => {
      onLayout?.(event);
      setLayout(event.nativeEvent.layout);
    },
    [onLayout],
  );

  const bandWidth = Math.max(Math.round(layout.width * 0.45), 24);
  const translateX = React.useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-bandWidth, layout.width + bandWidth],
      }),
    [bandWidth, layout.width, progress],
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
    translateX,
    shimmerContainerStyle: skeletonStyles.shimmerContainer,
    shimmerBandStyle: [skeletonStyles.shimmerBand, themeStyles.shimmerBand],
    onLayout: handleLayout,
    progress,
  };
}
