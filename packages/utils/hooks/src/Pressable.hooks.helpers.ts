import { NativeTouchEvent, GestureResponderEvent } from 'react-native';

export function extractSingleTouch(e: GestureResponderEvent): NativeTouchEvent | null {
  const nativeEvent = e.nativeEvent;
  const touches = nativeEvent.touches;
  const changedTouches = nativeEvent.changedTouches;
  const hasTouches = touches && touches.length > 0;
  const hasChangedTouches = changedTouches && changedTouches.length > 0;

  return !hasTouches && hasChangedTouches ? changedTouches[0] : hasTouches ? touches[0] : nativeEvent;
}
