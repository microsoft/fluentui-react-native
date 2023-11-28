/** @jsxRuntime classic */
import * as React from 'react';

import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';

import type { TooltipProps } from './Tooltip.types';
import { tooltipName } from './Tooltip.types';

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

export const Tooltip = stagedComponent((props: TooltipProps) => {
  return (rest: TooltipProps, children: React.ReactNode) => {
    return <NativeTooltipView {...mergeProps(props, rest)}>{children}</NativeTooltipView>;
  };
});

Tooltip.displayName = tooltipName;

export default Tooltip;
