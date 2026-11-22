import { renderTooltip_unstable } from './renderTooltip';
import type { TooltipProps } from './tooltip.types';
import { useTooltip_unstable } from './useTooltip';

/** Attaches a native desktop tip and supplemental help without introducing a second view. */
export function Tooltip(props: TooltipProps) {
  return renderTooltip_unstable(useTooltip_unstable(props));
}
