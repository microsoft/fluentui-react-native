import { cloneElement } from 'react';
import type { ReactElement } from 'react';
import type { TooltipState } from './tooltip.types';

export function renderTooltip_unstable({ trigger, nativeProps }: TooltipState): ReactElement {
  return cloneElement(trigger, nativeProps);
}
