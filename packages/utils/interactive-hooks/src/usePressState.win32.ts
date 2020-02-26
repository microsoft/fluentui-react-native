import * as React from 'react';
import { UIManager, NativeTouchEvent, GestureResponderEvent } from 'react-native';
import { IViewProps } from '@fluentui-native/adapters/lib/adapters.win32';
import { IPosition, IDimensions } from './Responder.types';
import { IPressState, IWithPressableOptions } from './Pressable.types';

function extractSingleTouch(e: GestureResponderEvent): NativeTouchEvent | null {
  const nativeEvent = e.nativeEvent;
  const touches = nativeEvent.touches;
  const changedTouches = nativeEvent.changedTouches;
  const hasTouches = touches && touches.length > 0;
  const hasChangedTouches = changedTouches && changedTouches.length > 0;

  return !hasTouches && hasChangedTouches ? changedTouches[0] : hasTouches ? touches[0] : nativeEvent;
}

export function usePressState(props: IWithPressableOptions<IViewProps>): [IViewProps, IPressState] {
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
