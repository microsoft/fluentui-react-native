import React from 'react';

import { usePressability } from './usePressability';
import type {
  IPressableHooks,
  IWithPressableOptions,
  IPressState,
  IHoverState,
  IFocusState,
  IWithPressableEvents,
} from './useAsPressable.types';
import type { PressableFocusProps, PressableHoverProps, PressablePressProps } from './usePressableState.types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

/**
 * hover specific state and callback helper
 */
function useHoverHelper(props: PressableHoverProps): [PressableHoverProps, IHoverState] {
  const [hoverState, setHoverState] = React.useState({ hovered: false });
  const { onHoverIn: onHoverInProp, onHoverOut: onHoverOutProp } = props;

  const onHoverIn = React.useCallback(
    (e) => {
      setHoverState({ hovered: true });
      if (onHoverInProp) {
        onHoverInProp(e);
      }
    },
    [onHoverInProp, setHoverState],
  );

  const onHoverOut = React.useCallback(
    (e) => {
      setHoverState({ hovered: false });
      if (onHoverOutProp) {
        onHoverOutProp(e);
      }
    },
    [onHoverOutProp, setHoverState],
  );
  return [{ onHoverIn, onHoverOut }, hoverState];
}

/**
 * focus specific state and callback helper
 */
function useFocusHelper(props: PressableFocusProps): [PressableFocusProps, IFocusState] {
  const [focusState, setFocusState] = React.useState({ focused: false });
  const { onBlur: onBlurProp, onFocus: onFocusProp } = props;
  const onFocus = React.useCallback(
    (e) => {
      setFocusState({ focused: true });
      if (onFocusProp) {
        onFocusProp(e);
      }
    },
    [onFocusProp, setFocusState],
  );

  const onBlur = React.useCallback(
    (e) => {
      setFocusState({ focused: false });
      if (onBlurProp) {
        onBlurProp(e);
      }
    },
    [onBlurProp, setFocusState],
  );
  return [{ onFocus, onBlur }, focusState];
}

/**
 * press specific state and callback helper
 */
function usePressHelper(props: PressablePressProps): [PressablePressProps, IPressState] {
  const [pressState, setPressState] = React.useState({ pressed: false });
  const { onPressIn: onPressInProp, onPressOut: onPressOutProp } = props;

  const onPressIn = React.useCallback(
    (e) => {
      setPressState({ pressed: true });
      if (onPressInProp) {
        onPressInProp(e);
      }
    },
    [onPressInProp, setPressState],
  );

  const onPressOut = React.useCallback(
    (e) => {
      setPressState({ pressed: false });
      if (onPressOutProp) {
        onPressOutProp(e);
      }
    },
    [onPressOutProp, setPressState],
  );

  return [{ onPressIn, onPressOut }, pressState];
}

/**
 * A more focused version of useAsPressable, if only one state is needed.  Note that if two or more states are needed then useAsPressable is better
 * as each of these calls will create a new instance of the Pressability class.
 * @param props - input props for the component
 */
export function useFocusState<T extends ObjectBase>(props: IWithPressableOptions<T>): [IWithPressableEvents<T>, IFocusState] {
  const [focusProps, focusState] = useFocusHelper(props);
  return [{ ...props, ...usePressability({ ...props, ...focusProps }) }, focusState];
}

/**
 * A more focused version of useAsPressable, if only one state is needed.  Note that if two or more states are needed then useAsPressable is better
 * as each of these calls will create a new instance of the Pressability class.
 * @param props - input props for the component
 */
export function usePressState<T extends ObjectBase>(props: IWithPressableOptions<T>): [IWithPressableEvents<T>, IPressState] {
  const [pressProps, pressState] = usePressHelper(props);
  return [{ ...props, ...usePressability({ ...props, ...pressProps }) }, pressState];
}

/**
 * A more focused version of useAsPressable, if only one state is needed.  Note that if two or more states are needed then useAsPressable is better
 * as each of these calls will create a new instance of the Pressability class.
 * @param props - input props for the component
 */
export function useHoverState<T extends ObjectBase>(props: IWithPressableOptions<T>): [IWithPressableEvents<T>, IHoverState] {
  const [hoverProps, hoverState] = useHoverHelper(props);
  return [{ ...props, ...usePressability({ ...props, ...hoverProps }) }, hoverState];
}

/**
 * The useAsPressable hook adds a simple state change function for listening to hover, press, and focus events on the base pressability implementation
 * @param props - input props for the component, mixed in with pressable and pressability options
 */
export function useAsPressable<T extends ObjectBase>(props: IWithPressableOptions<T>): IPressableHooks<T> {
  const [hoverProps, hoverState] = useHoverHelper(props);
  const [focusProps, focusState] = useFocusHelper(props);
  const [pressProps, pressState] = usePressHelper(props);
  const pressabilityProps = usePressability({ ...props, ...hoverProps, ...focusProps, ...pressProps });

  return {
    props: { ...props, ...pressabilityProps },
    state: { ...hoverState, ...focusState, ...pressState },
  };
}
