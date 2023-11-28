/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';

import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import type { UseSlots } from '@fluentui-react-native/framework';

import type { TooltipType, TooltipProps } from './Tooltip.types';
import { tooltipName } from './Tooltip.types';
import { useTooltip } from './useTooltip';

const NativeTooltipView = ensureNativeComponent('RCTTooltip');

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the tooltip.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the tooltip
 * @returns Whether the styles that are assigned to the layer should be applied to the tooltip
 */
export const tooltipLookup = (layer: string, userProps: TooltipProps): boolean => {
  return userProps[layer];
};

export const Tooltip = compose<TooltipType>({
  displayName: tooltipName,
  slots: {
    root: NativeTooltipView,
  },
  useRender: (userProps: TooltipProps, useSlots: UseSlots<TooltipType>) => {
    const tooltipProps = useTooltip(userProps);
    const Slots = useSlots(userProps, (layer) => tooltipLookup(layer, userProps));

    return (final: TooltipProps, ...children: React.ReactNode[]) => {
      const { ...mergedProps } = mergeProps(tooltipProps, final);

      return <Slots.root {...mergedProps}>{children}</Slots.root>;
    };
  },
});
