/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { tooltip, TooltipType, TooltipProps } from './Tooltip.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './Tooltip.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useTooltip } from './useTooltip';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the tooltip.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the tooltip
 * @returns Whether the styles that are assigned to the layer should be applied to the tooltip
 */
export const tooltipLookup = (layer: string, userProps: TooltipProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

export const Tooltip = compose<TooltipType>({
  displayName: tooltip,
  ...stylingSettings,
  slots: {
    root: View,
    text: Text,
  },
  useRender: (userProps: TooltipProps, useSlots: UseSlots<TooltipType>) => {
    const tooltipProps = useTooltip(userProps);
    const Slots = useSlots(userProps, (layer) => tooltipLookup(layer, userProps));

    return (final: TooltipProps, ...children: React.ReactNode[]) => {
      const { text, ...mergedProps } = mergeProps(tooltipProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.text>{text}</Slots.text>
          {children}
        </Slots.root>
      );
    };
  },
});
