/** @jsx withSlots */
import { View } from 'react-native';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Svg } from 'react-native-svg';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { spinnerName, SpinnerProps, SpinnerType } from './Spinner.types';
import { RCTNativeAnimatedSpinner } from './consts.win32';

/* TODO: Implement Spinner with following slots */
export const ActivityIndicator = compose<SpinnerType>({
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
