import * as React from 'react';
import { getClassicCustomRender } from './render';
import type { RenderResult, RenderType } from './render.types';

/**
 * Renders a slot
 *
 * @param slot - native react type or slot function to render
 * @param extraProps - additional props to mixin
 * @param children - the children to pass down to the slot
 */
export function renderSlot(slot: RenderType, extraProps: unknown, ...children: React.ReactNode[]): RenderResult {
  const customRender = getClassicCustomRender(slot, extraProps, children);
  return customRender ? customRender() : React.createElement(slot, extraProps, ...children);
}
