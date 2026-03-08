import React from 'react';

import { usePressability } from './usePressability';
import type {
  IPressableHooks,
  IWithPressableOptions,
  IPressState,
  IHoverState,
  IFocusState,
  IWithPressableEvents,
  IWithPartialPressableEvents,
} from './useAsPressable.types';
import type { BlurEvent, FocusEvent, MouseEvent, GestureResponderEvent } from 'react-native';
import type { PressableFocusProps, PressableHoverProps, PressablePressProps } from './usePressableState.types';

type ObjectBase = object;

/**
 * hover specific state and callback helper
 */
function useHoverHelper(props: PressableHoverProps): [PressableHoverProps, IHoverState] {
  const [hoverState, setHoverState] = React.useState({ hovered: false });

  const onHoverIn = React.useCallback(
    (e: MouseEvent) => {
      setHoverState({ hovered: true });
      if (props.onHoverIn) {
        props.onHoverIn(e);
      }
    },
    [setHoverState, props.onHoverIn],
  );

  const onHoverOut = React.useCallback(
    (e: MouseEvent) => {
      setHoverState({ hovered: false });
      if (props.onHoverOut) {
        props.onHoverOut(e);
      }
    },
    [setHoverState, props.onHoverOut],
  );
  return [{ onHoverIn, onHoverOut }, hoverState];
}

/**
 * focus specific state and callback helper
 */
function useFocusHelper(props: PressableFocusProps): [PressableFocusProps, IFocusState] {
  const [focusState, setFocusState] = React.useState({ focused: false });
  const onFocus = React.useCallback(
    (e: FocusEvent) => {
      setFocusState({ focused: true });
      if (props.onFocus) {
        props.onFocus(e);
      }
    },
    [setFocusState, props.onFocus],
  );

  const onBlur = React.useCallback(
    (e: BlurEvent) => {
      setFocusState({ focused: false });
      if (props.onBlur) {
        props.onBlur(e);
      }
    },
    [setFocusState, props.onBlur],
  );
  return [{ onFocus, onBlur }, focusState];
}

/**
 * press specific state and callback helper
 */
function usePressHelper(props: PressablePressProps): [PressablePressProps, IPressState] {
  const [pressState, setPressState] = React.useState({ pressed: false });

  const onPressIn = React.useCallback(
    (e: GestureResponderEvent) => {
      setPressState({ pressed: true });
      if (props.onPressIn) {
        props.onPressIn(e);
      }
    },
    [setPressState, props.onPressIn],
  );

  const onPressOut = React.useCallback(
    (e: GestureResponderEvent) => {
      setPressState({ pressed: false });
      if (props.onPressOut) {
        props.onPressOut(e);
      }
    },
    [setPressState, props.onPressOut],
  );

  return [{ onPressIn, onPressOut }, pressState];
}

/**
 * A more focused version of useAsPressable, if only one state is needed.  Note that if two or more states are needed then useAsPressable is better
 * as each of these calls will create a new instance of the Pressability class.
 * @param props - input props for the component
 */
export function useFocusState<T extends ObjectBase>(props: IWithPressableOptions<T>): [IWithPartialPressableEvents<T>, IFocusState] {
  const [focusProps, focusState] = useFocusHelper(props);
  return [{ ...props, ...usePressability({ ...props, ...focusProps }) }, focusState];
}

/**
 * A more focused version of useAsPressable, if only one state is needed.  Note that if two or more states are needed then useAsPressable is better
 * as each of these calls will create a new instance of the Pressability class.
 * @param props - input props for the component
 */
export function usePressState<T extends ObjectBase>(props: IWithPressableOptions<T>): [IWithPartialPressableEvents<T>, IPressState] {
  const [pressProps, pressState] = usePressHelper(props);
  return [{ ...props, ...usePressability({ ...props, ...pressProps }) }, pressState];
}

/**
 * A more focused version of useAsPressable, if only one state is needed.  Note that if two or more states are needed then useAsPressable is better
 * as each of these calls will create a new instance of the Pressability class.
 * @param props - input props for the component
 */
export function useHoverState<T extends ObjectBase>(props: IWithPressableOptions<T>): [IWithPartialPressableEvents<T>, IHoverState] {
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
    props: { ...props, ...pressabilityProps } as IWithPressableEvents<T>,
    state: { ...hoverState, ...focusState, ...pressState },
  };
}
