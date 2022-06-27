/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { testy, TestyType, TestyProps } from './Testy.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Testy.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useTesty } from './useTesty';
/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the testy.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the testy
 * @returns Whether the styles that are assigned to the layer should be applied to the testy
 */
export const testyLookup = (layer: string, userProps: TestyProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

export const Testy = compose<TestyType>({
  displayName: testy,
  ...stylingSettings,
  slots: {
    root: View,
    text: Text,
  },
  useRender: (userProps: TestyProps, useSlots: UseSlots<TestyType>) => {
    const testyProps = useTesty(userProps);
    const Slots = useSlots(userProps, (layer) => testyLookup(layer, userProps));

    return (final: TestyProps, ...children: React.ReactNode[]) => {
      const { text, ...mergedProps } = mergeProps(testyProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.text>{text}</Slots.text>
          {children}
        </Slots.root>
      );
    };
  },
});
