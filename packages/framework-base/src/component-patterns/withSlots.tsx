import type React from 'react';
import { renderForClassicRuntime } from './render';

/**
 * Legacy JSX handler for the classic runtime. New code should NOT use this.
 *
 * Prefer the custom automatic JSX runtime instead by adding the jsxImportSource pragma pointing at
 * "@fluentui-react-native/framework-base" as the first line of a file. That runtime resolves slots
 * automatically without importing any helper. See the package README for the exact pragma to use.
 *
 * This function is a slot resolver that automatically evaluates slot functions to generate React elements.
 * A byproduct of this resolver is that it removes slots from the React hierarchy by bypassing React.createElement.
 *
 * To use this legacy helper on a per-file basis, add the classic-runtime jsx directive targeting withSlots
 * as the first line of the file, and import withSlots. This is only retained for deprecated framework code.
 *
 * See React.createElement
 */

// Can't use typeof on React.createElement since it's overloaded. Approximate createElement's signature for now and widen as needed.
export function withSlots(reactType: Parameters<typeof React.createElement>[0], props?: unknown, ...children: React.ReactNode[]) {
  return renderForClassicRuntime(reactType, props, children);
}
