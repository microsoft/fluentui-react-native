import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import type { SpinnerState } from './spinner.types';

/**
 * Applies token-derived and instance-derived styles to Spinner slots.
 */
export function useSpinnerStyles_unstable(state: SpinnerState) {
  const rootStyle: StyleProp<ViewStyle> = [state.rootStyle, state.userStyle];
  const svgStyle: StyleProp<ViewStyle> =
    state.reduceMotionEnabled === false
      ? [
          state.svgStyle,
          {
            transform: [
              {
                rotate: state.rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]
      : state.svgStyle;

  attachSlotProps(state.root, {
    style: rootStyle,
  });

  attachSlotProps(state.svg, {
    style: svgStyle,
  });
}
