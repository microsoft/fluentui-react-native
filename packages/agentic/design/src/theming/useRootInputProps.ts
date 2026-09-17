import * as React from 'react';
import { Platform } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';

import type { RootInputController } from './rootInputController';

const modifierKeys = new Set(['Alt', 'Control', 'Meta', 'Shift', 'CapsLock', 'NumLock', 'ScrollLock', 'Fn']);

export function useRootInputProps(props: IViewProps, controller: RootInputController, enabled: boolean): IViewProps {
  const { onKeyDown, onKeyDownCapture, onKeyUpCapture, onPointerDownCapture, onStartShouldSetResponderCapture } = props;
  const trackKeyboard = React.useCallback(
    (key: string | undefined) => {
      if (!modifierKeys.has(key ?? '')) {
        controller.setInputModality('keyboard');
      }
    },
    [controller],
  );
  const keyDown = React.useCallback<NonNullable<IViewProps['onKeyDown']>>(
    (event) => {
      trackKeyboard(event.nativeEvent.key);
      onKeyDown?.(event);
    },
    [onKeyDown, trackKeyboard],
  );
  const keyDownCapture = React.useCallback<NonNullable<IViewProps['onKeyDownCapture']>>(
    (event) => {
      trackKeyboard(event.nativeEvent.key);
      onKeyDownCapture?.(event);
    },
    [onKeyDownCapture, trackKeyboard],
  );
  const keyUpCapture = React.useCallback<NonNullable<IViewProps['onKeyUpCapture']>>(
    (event) => {
      trackKeyboard(event.nativeEvent.key);
      onKeyUpCapture?.(event);
    },
    [onKeyUpCapture, trackKeyboard],
  );
  const pointerDownCapture = React.useCallback<NonNullable<IViewProps['onPointerDownCapture']>>(
    (event) => {
      controller.setInputModality('pointer');
      onPointerDownCapture?.(event);
    },
    [controller, onPointerDownCapture],
  );
  const startShouldSetResponderCapture = React.useCallback<NonNullable<IViewProps['onStartShouldSetResponderCapture']>>(
    (event) => {
      controller.setInputModality('pointer');
      return onStartShouldSetResponderCapture?.(event) ?? false;
    },
    [controller, onStartShouldSetResponderCapture],
  );

  return enabled
    ? {
        ...(Platform.OS !== 'ios' && Platform.OS !== 'android'
          ? {
              onKeyDown: keyDown,
              onKeyDownCapture: keyDownCapture,
              onKeyUpCapture: keyUpCapture,
            }
          : {}),
        onPointerDownCapture: pointerDownCapture,
        onStartShouldSetResponderCapture: startShouldSetResponderCapture,
      }
    : {};
}
