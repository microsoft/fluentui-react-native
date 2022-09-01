/**  @jsx withSlots */
import { compose, mergeProps, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';
import React from 'react';
import { View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { optionName, OptionProps, OptionType } from './Option.types';

export const Option = compose<OptionType>({
  displayName: optionName,
  slots: {
    root: View,
    checkIcon: Svg,
    label: Text,
  },
  useRender: (userProps: OptionProps, useSlots: UseSlots<OptionType>) => {
    const Slots = useSlots(userProps);
    return (final: OptionProps, ...children: React.ReactNode[]) => {
      const mergedProps = mergeProps(userProps, final);

      const checkPath = (
        <Path
          d="M9.76497 3.20474C10.0661 3.48915 10.0797 3.96383 9.79526 4.26497L5.54526 8.76497C5.40613 8.91228 5.21332 8.99703 5.01071 8.99993C4.8081 9.00282 4.61295 8.92361 4.46967 8.78033L2.21967 6.53033C1.92678 6.23744 1.92678 5.76257 2.21967 5.46967C2.51256 5.17678 2.98744 5.17678 3.28033 5.46967L4.98463 7.17397L8.70474 3.23503C8.98915 2.9339 9.46383 2.92033 9.76497 3.20474Z"
          fill="currentColor"
        />
      );

      // TODO: Handle non-string children
      const label = <Slots.label>{children}</Slots.label>;

      return (
        <Slots.root {...mergedProps}>
          {/* TODO: Move viewBox to styling */}
          <Slots.checkIcon viewBox="0 0 12 12">{checkPath}</Slots.checkIcon>
          {label}
        </Slots.root>
      );
    };
  },
});
