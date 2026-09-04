import { renderTooltip_unstable } from './renderTooltip';
import type { TooltipProps } from './tooltip.types';
import { useTooltipStyles_unstable } from './useTooltipStyles';
import { useTooltip_unstable } from './useTooltip';

/**
 * Tooltip is a trigger plus a short, non-interactive label that describes it and is revealed by pointer entry or focus.
 */
export const Tooltip = (props: TooltipProps) => {
  const state = useTooltip_unstable(props);
  useTooltipStyles_unstable(state);
  return renderTooltip_unstable(state);
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;
