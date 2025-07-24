import type React from 'react';
import { renderSlot } from './renderSlot';

/**
 * This function is required for any module that uses slots.
 *
 * This function is a slot resolver that automatically evaluates slot functions to generate React elements.
 * A byproduct of this resolver is that it removes slots from the React hierarchy by bypassing React.createElement.
 *
 * To use this function on a per-file basis, use the jsx directive targeting withSlots.
 * This directive must be the FIRST LINE in the file to work correctly.
 * Usage of this pragma also requires withSlots import statement.
 *
 * See React.createElement
 */

// Can't use typeof on React.createElement since it's overloaded. Approximate createElement's signature for now and widen as needed.
export function withSlots(reactType: Parameters<typeof React.createElement>[0], props?: unknown, ...children: React.ReactNode[]) {
  // if it is a non-string type with _canCompose set just call the function directly, otherwise call createElement as normal
  return renderSlot(reactType, props, ...children);
}
