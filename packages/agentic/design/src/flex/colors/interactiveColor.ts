import type { ColorValue } from 'react-native';

import type { InteractiveColor } from '../tokens.types';

/** An explicit state value, or a function that computes it on first read. */
export type InteractiveColorState = ColorValue | (() => ColorValue);

// Used only to reject resolved envelopes passed back as authored input.
const resolvedColors = new WeakSet<object>();

/** Return whether a value is a package-created resolved `InteractiveColor`. */
export function isInteractiveColor(value: unknown): value is InteractiveColor {
  return typeof value === 'object' && value !== null && resolvedColors.has(value);
}

function defineState(target: object, name: 'hover' | 'pressed', state: InteractiveColorState): void {
  if (typeof state !== 'function') {
    Object.defineProperty(target, name, { value: state, enumerable: true });
    return;
  }

  let resolved = false;
  let value: ColorValue;
  Object.defineProperty(target, name, {
    enumerable: true,
    get: () => {
      if (!resolved) {
        value = state();
        resolved = true;
      }
      return value;
    },
  });
}

/**
 * Create a frozen resolved color. Function states run on first read and are
 * memoized independently.
 */
export function createInteractiveColor(rest: ColorValue, hover: InteractiveColorState, pressed: InteractiveColorState): InteractiveColor {
  const color = {};
  Object.defineProperty(color, 'rest', { value: rest, enumerable: true });
  defineState(color, 'hover', hover);
  defineState(color, 'pressed', pressed);
  Object.freeze(color);
  resolvedColors.add(color);
  return color as InteractiveColor;
}
