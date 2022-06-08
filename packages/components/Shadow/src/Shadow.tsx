/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { shadow, ShadowType, ShadowProps } from './Shadow.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Shadow.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useShadow } from './useShadow';
/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the Shadow.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the Shadow
 * @returns Whether the styles that are assigned to the layer should be applied to the Shadow
 */
export const shadowLookup = (layer: string, userProps: ShadowProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

export const Shadow = compose<ShadowType>({
  displayName: shadow,
  ...stylingSettings,
  slots: {
    root: View,
    text: Text,
  },
  useRender: (userProps: ShadowProps, useSlots: UseSlots<ShadowType>) => {
    const shadowProps = useShadow(userProps);
    const Slots = useSlots(userProps, (layer) => shadowLookup(layer, userProps));

    return (final: ShadowProps, ...children: React.ReactNode[]) => {
      const { text, ...mergedProps } = mergeProps(shadowProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.text>{text}</Slots.text>
          {children}
        </Slots.root>
      );
    };
  },
});
