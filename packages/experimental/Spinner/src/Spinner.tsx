/** @jsx withSlots */
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Svg } from 'react-native-svg';

import { RCTNativeAnimatedSpinner } from './consts.win32';
import type { SpinnerProps, SpinnerType } from './Spinner.types';
import { spinnerName } from './Spinner.types';

/* TODO: Implement Spinner with following slots */
export const Spinner = compose<SpinnerType>({
  displayName: spinnerName,
  slots: {
    root: View,
    track: Svg,
    tail: Svg,
    tailContainer: RCTNativeAnimatedSpinner,
    label: Text,
  },
  useRender: (props: SpinnerProps, useSlots: UseSlots<SpinnerType>) => {
    const Slots = useSlots(props);

    return (rest: SpinnerProps) => {
      const { ...mergedProps } = mergeProps(props, rest);
      return (
        <Slots.root {...mergedProps}>
          <Slots.label />
        </Slots.root>
      );
    };
  },
});
