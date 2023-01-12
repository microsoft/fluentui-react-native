/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { divider, DividerType, DividerProps } from './Divider.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './Divider.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useDivider } from './useDivider';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the divider.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the divider
 * @returns Whether the styles that are assigned to the layer should be applied to the divider
 */
export const dividerLookup = (layer: string, userProps: DividerProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

export const Divider = compose<DividerType>({
  displayName: divider,
  ...stylingSettings,
  slots: {
    root: View,
    text: Text,
  },
  useRender: (userProps: DividerProps, useSlots: UseSlots<DividerType>) => {
    const dividerProps = useDivider(userProps);
    const Slots = useSlots(userProps, (layer) => dividerLookup(layer, userProps));

    return (final: DividerProps, ...children: React.ReactNode[]) => {
      const { text, ...mergedProps } = mergeProps(dividerProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.text>{text}</Slots.text>
          {children}
        </Slots.root>
      );
    };
  },
});
