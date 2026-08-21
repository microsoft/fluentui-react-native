import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { spinnerStyles, getSpinnerRootStyle } from './spinner.styles';
import type { SpinnerState } from './spinner.types';

/**
 * Applies token-derived and instance-derived styles to Spinner slots.
 */
export function useSpinnerStyles_unstable(state: SpinnerState) {
  const rootStyle: StyleProp<ViewStyle> = [spinnerStyles.root, getSpinnerRootStyle(state), state.userStyle];
  const svgStyle: StyleProp<ViewStyle> =
    state.reduceMotionEnabled === false
      ? [
          spinnerStyles.svg,
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
      : spinnerStyles.svg;

  attachSlotProps(state.root, {
    style: rootStyle,
  });

  attachSlotProps(state.svg, {
    style: svgStyle,
  });
}
