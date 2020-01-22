import * as React from 'react';
import { UIManager, GestureResponderEvent } from 'react-native';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { IPosition, IDimensions } from 'src/components/Pressable/Pressable.types';
import { extractSingleTouch } from './Pressable.hooks.helpers';
import {
  IPressableState,
  IPressableHooks,
  IWithPressableOptions,
  IFocusState,
  IHoverState,
  IPressState,
  IHoverProps,
  IFocusProps,
  IPressProps
} from 'src/components/Pressable/Pressable.props';

export function usePressState(props: IWithPressableOptions<IViewWin32Props>): [IPressProps, IPressState] {
  const positionOnActivate = React.useRef<IPosition | null>(null);
  const dimensionsOnActivate = React.useRef<IDimensions>({ width: 0, height: 0 });

  const handleQueryLayout = React.useCallback(
    (l: number, t: number, w: number, h: number, globalX: number, globalY: number) => {
      if (!l && !t && !w && !h && !globalX && !globalY) {
        return;
      }
      positionOnActivate.current = { left: globalX, top: globalY };
      dimensionsOnActivate.current = { width: w, height: h };
    },
    [positionOnActivate, dimensionsOnActivate]
  );

  const [state, setPressState] = React.useState({ pressed: false });
  const onTouchStart = React.useCallback(
    (e: GestureResponderEvent) => {
      setPressState({ pressed: true });
      // get layout position and dimension of currentTarget
      const tag = e.currentTarget;
      UIManager.measure(tag, handleQueryLayout);
    },
    [setPressState, handleQueryLayout]
  );
  const onTouchCancel = React.useCallback(() => setPressState({ pressed: false }), [setPressState]);
  const onTouchEnd = React.useCallback(
    (e: GestureResponderEvent) => {
      const touch = extractSingleTouch(e);

      const pageX = touch && touch.pageX;
      const pageY = touch && touch.pageY;

      const isTouchWithinActive =
        pageX === null || pageY === null
          ? false
          : positionOnActivate.current && dimensionsOnActivate.current
          ? pageX > positionOnActivate.current.left &&
            pageY > positionOnActivate.current.top &&
            pageX < positionOnActivate.current.left + dimensionsOnActivate.current.width &&
            pageY < positionOnActivate.current.top + dimensionsOnActivate.current.height
          : false;

      state && !props.disabled && isTouchWithinActive && props.onPress && props.onPress();
      setPressState({ pressed: false });
    },
    [state, props.onPress, props.disabled]
  );
  return [{ onTouchStart, onTouchCancel, onTouchEnd }, state];
}

export function useHoverState(): [IHoverProps, IHoverState] {
  const [state, setHoverState] = React.useState({ hovered: false });
  const onMouseEnter = React.useCallback(() => setHoverState({ hovered: true }), [setHoverState]);
  const onMouseLeave = React.useCallback(() => setHoverState({ hovered: false }), [setHoverState]);
  return [{ onMouseEnter, onMouseLeave }, state];
}

export function useFocusState(): [IFocusProps, IFocusState] {
  const [state, setFocusState] = React.useState({ focused: false });
  const onFocus = React.useCallback(() => setFocusState({ focused: true }), [setFocusState]);
  const onBlur = React.useCallback(() => setFocusState({ focused: false }), [setFocusState]);
  return [{ onFocus, onBlur }, state];
}

export function useAsPressable(props: IWithPressableOptions<IViewWin32Props>): IPressableHooks {
  const [hoverProps, hoverState] = useHoverState();
  const [pressProps, pressState] = usePressState(props);
  const [focusProps, focusState] = useFocusState();

  const newProps = {
    ...props,
    ...hoverProps,
    ...pressProps,
    ...focusProps
  };
  const newState: IPressableState = {
    ...hoverState,
    ...pressState,
    ...focusState
  };

  return { props: newProps, state: newState };
}
