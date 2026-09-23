/** @jsxImportSource @fluentui-react-native/framework-base */
import { Animated } from 'react-native';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';

import type { SkeletonState } from './skeleton.types';

export function renderSkeleton_unstable(state: SkeletonState) {
  const shouldAnimate = !state.reduceMotion && state.shimmerColor !== undefined && state.layout.width > 0 && state.layout.height > 0;

  return (
    <state.root>
      {shouldAnimate ? (
        <Animated.View
          testID="skeleton-shimmer"
          pointerEvents="none"
          style={[
            state.shimmerContainerStyle,
            {
              transform: [{ translateX: state.translateX }],
              width: state.shimmerWidth,
            },
          ]}
        >
          <Svg
            accessible={false}
            height={state.layout.height}
            viewBox={`0 0 ${state.shimmerWidth} ${state.layout.height}`}
            width={state.shimmerWidth}
          >
            <Defs>
              <LinearGradient
                id={state.gradientId}
                gradientUnits="userSpaceOnUse"
                x1={state.layout.height}
                y1={0}
                x2={state.layout.height + state.bandWidth / 2}
                y2={state.bandWidth / 2}
              >
                <Stop offset={0} stopColor={state.shimmerColor} stopOpacity={0} />
                <Stop offset={0.5} stopColor={state.shimmerColor} stopOpacity={0.64} />
                <Stop offset={1} stopColor={state.shimmerColor} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect fill={`url(#${state.gradientId})`} height={state.layout.height} width={state.shimmerWidth} />
          </Svg>
        </Animated.View>
      ) : null}
    </state.root>
  );
}
