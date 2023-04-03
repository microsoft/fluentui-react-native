/** @jsx withSlots */
import { Animated, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Svg } from 'react-native-svg';

import type { SpinnerProps, SpinnerType } from './Spinner.types';
import { spinnerName } from './Spinner.types';

export const AnimatedSvg = Animated.createAnimatedComponent(Svg);
export const Spinner = compose<SpinnerType>({
  displayName: spinnerName,
  slots: {
    root: View,
    svg: AnimatedSvg,
  },
  useRender: (props: SpinnerProps, useSlots: UseSlots<SpinnerType>) => {
    const Slots = useSlots(props);

    return (rest: SpinnerProps) => {
      const { ...mergedProps } = mergeProps(props, rest);
      return <Slots.root {...mergedProps}></Slots.root>;
    };
  },
});
