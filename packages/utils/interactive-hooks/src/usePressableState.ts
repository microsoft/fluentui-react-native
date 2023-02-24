import * as React from 'react';

import type {
  HoverState,
  FocusState,
  PressState,
  PressableState,
  PressableFocusProps,
  PressableHoverProps,
  PressablePressProps,
  PressablePropsExtended,
} from './usePressableState.types';

/**
 * hover specific state and callback helper
 */
export function useHoverHelper(props: PressableHoverProps): [PressableHoverProps, HoverState] {
  const [hoverState, setHoverState] = React.useState({ hovered: false });
  const { onHoverIn, onHoverOut } = props;

  const _onHoverIn = React.useCallback(
    (e) => {
      setHoverState({ hovered: true });
      onHoverIn?.(e);
    },
    [setHoverState, onHoverIn],
  );

  const _onHoverOut = React.useCallback(
    (e) => {
      setHoverState({ hovered: false });
      onHoverOut?.(e);
    },
    [setHoverState, onHoverOut],
  );
  return [{ onHoverIn: _onHoverIn, onHoverOut: _onHoverOut }, hoverState];
}

/**
 * focus specific state and callback helper
 */
export function useFocusHelper(props: PressableFocusProps): [PressableFocusProps, FocusState] {
  const [focusState, setFocusState] = React.useState({ focused: false });
  const { onFocus, onBlur } = props;
  const _onFocus = React.useCallback(
    (e) => {
      setFocusState({ focused: true });
      onFocus?.(e);
    },
    [setFocusState, onFocus],
  );

  const _onBlur = React.useCallback(
    (e) => {
      setFocusState({ focused: false });
      onBlur?.(e);
    },
    [setFocusState, onBlur],
  );
  return [{ onFocus: _onFocus, onBlur: _onBlur }, focusState];
}

/**
 * press specific state and callback helper
 */
export function usePressHelper(props: PressablePressProps): [PressablePressProps, PressState] {
  const [pressState, setPressState] = React.useState({ pressed: false });
  const { onPressIn, onPressOut } = props;

  const _onPressIn = React.useCallback(
    (e) => {
      setPressState({ pressed: true });
      onPressIn?.(e);
    },
    [setPressState, onPressIn],
  );

  const _onPressOut = React.useCallback(
    (e) => {
      setPressState({ pressed: false });
      onPressOut?.(e);
    },
    [setPressState, onPressOut],
  );

  return [{ onPressIn: _onPressIn, onPressOut: _onPressOut }, pressState];
}

/**
 * This routine hooks the props to pass to a Pressable component to obtain the current state of the Pressable as well as generating
 * state change updates when those props change. This allows a parent component to control the render of the whole component rather than having
 * to split the code between a child function or style function.
 *
 * @param props - props to pass to a Pressable component
 * @returns - modified props to pass into the Pressable as well as the current state with regards to hover, focus, and press
 */
export function usePressableState(props: PressablePropsExtended): { props: PressablePropsExtended; state: PressableState } {
  const { onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur, ...rest } = props;
  const [hoverProps, hoverState] = useHoverHelper({ onHoverIn, onHoverOut });
  const [focusProps, focusState] = useFocusHelper({ onFocus, onBlur });
  const [pressProps, pressState] = usePressHelper({ onPressIn, onPressOut });

  return { props: { ...hoverProps, ...focusProps, ...pressProps, ...rest }, state: { ...hoverState, ...focusState, ...pressState } };
}
