import * as React from 'react';
import type { PressableProps } from 'react-native';
import type { PressableState } from '../types/interactive.types';

const DEFAULT_STATE_KEYS: (keyof PressableState)[] = ['pressed', 'hovered', 'focused'];

export type UsePressableResult = [props: PressableProps, state: PressableState];

/**
 * A hook that augments a set of PressableProps with state tracking for some set of pressed, focused, and hovered states. This makes it
 * easier to use a pressable component and track its interactive state without having to manually manage the state for each of the events.
 *
 * For each tracked state key the matching event handlers are wrapped so that they update the tracked state and then forward to any handler
 * supplied in the incoming props. Handlers for states that are not tracked are passed through unchanged.
 *
 * @param props The PressableProps to augment with state tracking
 * @param stateKeys The keys of the PressableState to track. Defaults to all three keys.
 * @returns A tuple of the augmented props to spread onto a Pressable and the current interactive state for the tracked keys.
 */
export function usePressableState(props: PressableProps, stateKeys: (keyof PressableState)[] = DEFAULT_STATE_KEYS): UsePressableResult {
  // create a state entry to track the pressable state for the requested keys.
  const [state, setState] = React.useState<PressableState>(() => initialStateFromKeys(stateKeys));

  // determine which states are being tracked so that we can wrap the appropriate handlers
  const press = stateKeys.includes('pressed');
  const hover = stateKeys.includes('hovered');
  const focus = stateKeys.includes('focused');

  // pull out the interactive props so that we can wrap them with our own handlers, and then forward to the original handlers if they exist
  const { onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur } = props;

  // create a memoized object of the overrides to avoid creating new functions on every render. This is set up this way as this allows
  // this hook to only create the override functions for the keys that are requested to be tracked. It also only uses one hook entry for
  // the callbacks. The downside is changing one function will recreate all of the functions but realistically it is not common to change
  // the handlers frequently at runtime.
  const overrides = React.useMemo(() => {
    const callbacks: PressableProps = {};
    if (press) {
      callbacks.onPressIn = (e) => {
        setState((prev) => ({ ...prev, pressed: true }));
        onPressIn?.(e);
      };
      callbacks.onPressOut = (e) => {
        setState((prev) => ({ ...prev, pressed: false }));
        onPressOut?.(e);
      };
    }
    if (hover) {
      callbacks.onHoverIn = (e) => {
        setState((prev) => ({ ...prev, hovered: true }));
        onHoverIn?.(e);
      };
      callbacks.onHoverOut = (e) => {
        setState((prev) => ({ ...prev, hovered: false }));
        onHoverOut?.(e);
      };
    }
    if (focus) {
      callbacks.onFocus = (e) => {
        setState((prev) => ({ ...prev, focused: true }));
        onFocus?.(e);
      };
      callbacks.onBlur = (e) => {
        setState((prev) => ({ ...prev, focused: false }));
        onBlur?.(e);
      };
    }
    return callbacks;
  }, [press, hover, focus, onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur]);

  return [{ ...props, ...overrides }, state];
}

/**
 * Creates an initial state object for the requested keys, with all values set to false. This is used to initialize the state for the usePressableState hook.
 * @param keys The keys of the PressableState to initialize.
 * @returns An initial state object with all values set to false.
 */
function initialStateFromKeys(keys: (keyof PressableState)[]): PressableState {
  const initialState: PressableState = {};
  for (const key of keys) {
    initialState[key] = false;
  }
  return initialState;
}
