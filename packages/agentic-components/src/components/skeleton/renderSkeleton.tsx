/** @jsxImportSource @fluentui-react-native/framework-base */
import { Animated, View } from 'react-native';

import type { SkeletonState } from './skeleton.types';

export function renderSkeleton_unstable(state: SkeletonState) {
  const shouldAnimate = !state.reduceMotion && state.layout.width > 0 && state.layout.height > 0;

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
              width: state.bandWidth,
            },
          ]}
        >
          <View style={state.shimmerBandStyle} />
        </Animated.View>
      ) : null}
    </state.root>
  );
}
