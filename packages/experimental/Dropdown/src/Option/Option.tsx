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

      // TODO: Handle non-string children
      const label = <Slots.label>{children}</Slots.label>;

      return (
        <Slots.root {...mergedProps}>
          <Slots.checkIcon />
          {label}
        </Slots.root>
      );
    };
  },
});
