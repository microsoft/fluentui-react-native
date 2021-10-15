import * as React from 'react';
import { PressableProps } from 'react-native';
import { PressableFocusProps, PressableHoverProps, PressableHoverEventProps, PressablePressProps } from './Pressability/Pressability.types';
import {
  IPressableHooks,
  IWithPressableOptions,
  IPressState,
  IHoverState,
  IFocusState,
  IWithPressableEvents,
  IPressableState,
  PressablePropsExtended,
} from './useAsPressable.types';
import { usePressability } from './usePressability';

/**
 * hover specific state and callback helper
 */
function useHoverHelper(props: PressableHoverProps): [PressableHoverEventProps, IHoverState] {
  const [hoverState, setHoverState] = React.useState({ hovered: false });

  // https://github.com/facebook/react-native/issues/32406
  // Pressability exposes onHoverIn & onHoverOut, and converts them into onMouseEnter/onMouseLeave event handlers
  // passed into an inner <View> component. However, Pressable does not expose onHoverIn/onHoverOut as props. Our
  // desktop ports do expose onMouseEnter & onMouseLeave as event handlers on View though. As a workaround, let's
  // have our public API take in onHoverIn & onHoverOut as props, but pass them into Pressable as onMouseEnter & onMouseLeave

  const onMouseEnter = React.useCallback(
    (e) => {
      setHoverState({ hovered: true });
      if (props.onHoverIn) {
        props.onHoverIn(e);
      }
    },
    [setHoverState, props.onHoverIn],
  );

  const onMouseLeave = React.useCallback(
    (e) => {
      setHoverState({ hovered: false });
      if (props.onHoverOut) {
        props.onHoverOut(e);
      }
    },
    [setHoverState, props.onHoverOut],
  );
  return [{ onMouseEnter, onMouseLeave }, hoverState];
}

/**
 * focus specific state and callback helper
 */
function useFocusHelper(props: PressableFocusProps): [PressableFocusProps, IFocusState] {
  const [focusState, setFocusState] = React.useState({ focused: false });
  const onFocus = React.useCallback(
    (e) => {
      setFocusState({ focused: true });
      if (props.onFocus) {
        props.onFocus(e);
      }
    },
    [setFocusState, props.onFocus],
  );

  const onBlur = React.useCallback(
    (e) => {
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
    (e) => {
      setPressState({ pressed: true });
      if (props.onPressIn) {
        props.onPressIn(e);
      }
    },
    [setPressState, props.onPressIn],
  );

  const onPressOut = React.useCallback(
    (e) => {
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
// eslint-disable-next-line @typescript-eslint/ban-types
export function useFocusState<T extends object>(props: IWithPressableOptions<T>): [IWithPressableEvents<T>, IFocusState] {
  const [focusProps, focusState] = useFocusHelper(props);
  return [{ ...props, ...usePressability({ ...props, ...focusProps }) }, focusState];
}

/**
 * A more focused version of useAsPressable, if only one state is needed.  Note that if two or more states are needed then useAsPressable is better
 * as each of these calls will create a new instance of the Pressability class.
 * @param props - input props for the component
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function usePressState<T extends object>(props: IWithPressableOptions<T>): [IWithPressableEvents<T>, IPressState] {
  const [pressProps, pressState] = usePressHelper(props);
  return [{ ...props, ...usePressability({ ...props, ...pressProps }) }, pressState];
}

/**
 * A more focused version of useAsPressable, if only one state is needed.  Note that if two or more states are needed then useAsPressable is better
 * as each of these calls will create a new instance of the Pressability class.
 * @param props - input props for the component
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function useHoverState<T extends object>(props: IWithPressableOptions<T>): [IWithPressableEvents<T>, IHoverState] {
  // https://github.com/facebook/react-native/issues/32406
  // Pressability takes in onHoverIn & onHoverOut, while useHoverHelper returns onMouseEnter & onMouseLeave.
  // Lets be sure to pass these props properly into usePressability.
  const [hoverProps, hoverState] = useHoverHelper(props);
  const { onMouseEnter, onMouseLeave, ...restHoverProps } = hoverProps;
  return [{ ...props, ...usePressability({ ...props, onHoverIn: onMouseEnter, onHoverOut: onMouseLeave, ...restHoverProps }) }, hoverState];
}

/**
 * useAsPressable wraps the usePressability hook that will be available in RN 0.63 and beyond.  Once this library is on a recent enough
 * version of react-native this implementation can switch to using the official version.
 *
 * The useAsPressable hook adds a simple state change function for listening to hover, press, and focus events on the base pressability implementation
 * @param props - input props for the component, mixed in with pressable and pressability options
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function useAsPressable<T extends object>(props: IWithPressableOptions<T>): IPressableHooks<T> {
  const [hoverProps, hoverState] = useHoverHelper(props);
  const [focusProps, focusState] = useFocusHelper(props);
  const [pressProps, pressState] = usePressHelper(props);

  // https://github.com/facebook/react-native/issues/32406
  // Convert onMouseEnter & onMouseLeave back into onHoverIn & onHoverOut before passing into usePressability
  const pressabilityProps = usePressability({
    onHoverIn: hoverProps.onMouseEnter,
    onHoverOut: hoverProps.onMouseLeave,
    ...focusProps,
    ...pressProps,
  });

  return {
    props: { ...props, ...pressabilityProps },
    state: { ...hoverState, ...focusState, ...pressState },
  };
}

/**
 * This routine hooks the props to pass to a Pressable component to obtain the current state of the Pressable as well as generating
 * state change updates when those props change. This allows a parent component to control the render of the whole component rather than having
 * to split the code between a child function or style function.
 *
 * @param props - props to pass to a Pressable component
 * @returns - modified props to pass into the Pressable as well as the current state with regards to hover, focus, and press
 */
export function usePressableState(props: PressablePropsExtended): { props: PressableProps; state: IPressableState } {
  const { onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur, ...rest } = props;
  const [hoverProps, hoverState] = useHoverHelper({ onHoverIn, onHoverOut });
  const [focusProps, focusState] = useFocusHelper({ onFocus, onBlur });
  const [pressProps, pressState] = usePressHelper({ onPressIn, onPressOut });
  return { props: { ...hoverProps, ...focusProps, ...pressProps, ...rest }, state: { ...hoverState, ...focusState, ...pressState } };
}
