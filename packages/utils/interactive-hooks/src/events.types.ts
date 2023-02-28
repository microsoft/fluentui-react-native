import type { AccessibilityActionEvent, GestureResponderEvent, MouseEvent } from 'react-native';

import type { KeyPressEvent } from './useKeyProps.types';

export type InteractionEvent = GestureResponderEvent | MouseEvent | KeyPressEvent | AccessibilityActionEvent;

export const isGestureResponderEvent = (e: InteractionEvent): e is GestureResponderEvent => {
  if ('touches' in e.nativeEvent) {
    return true;
  }

  return false;
};

export const isMouseEvent = (e: InteractionEvent): e is MouseEvent => {
  if ('pageX' in e.nativeEvent) {
    return true;
  }

  return false;
};

export const isKeyPressEvent = (e: InteractionEvent): e is KeyPressEvent => {
  if ('key' in e.nativeEvent) {
    return true;
  }

  return false;
};

export const isAccessibilityActionEvent = (e: InteractionEvent): e is AccessibilityActionEvent => {
  if ('actionName' in e.nativeEvent) {
    return true;
  }

  return false;
};
