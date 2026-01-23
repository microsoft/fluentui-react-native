/** @jsxImportSource @fluentui-react-native/framework-base */
import { Animated, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { Svg } from 'react-native-svg';

import type { SpinnerProps, SpinnerType } from './Spinner.types';
import { spinnerName } from './Spinner.types';
import { useSpinner } from './useSpinner';

export const AnimatedSvg = Animated.createAnimatedComponent(Svg);
export const Spinner = compose<SpinnerType>({
  displayName: spinnerName,
  slots: {
    root: View,
    svg: AnimatedSvg,
  },
  useRender: (props: SpinnerProps, useSlots: UseSlots<SpinnerType>) => {
    const spinnerProps = useSpinner(props);
    const Slots = useSlots(spinnerProps);

    return (rest: SpinnerProps) => {
      const { ...mergedProps } = mergeProps(spinnerProps, rest);
      return <Slots.root {...mergedProps}></Slots.root>;
    };
  },
});
