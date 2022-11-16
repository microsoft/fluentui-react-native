import { AccessibilityActionEvent, GestureResponderEvent } from 'react-native';
import { KeyPressEvent } from './Pressability/CoreEventTypes';
import { isAccessibilityActionEvent, isGestureResponderEvent, isKeyPressEvent } from './events.types';

const createMockEvent = (nativeEvent) => {
  return {
    nativeEvent: nativeEvent,
    currentTarget: null,
    target: null,
    bubbles: false,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    preventDefault: () => {
      /* empty for test*/
    },
    isDefaultPrevented: () => {
      return false;
    },
    stopPropagation: () => {
      /* empty for test*/
    },
    isPropagationStopped: () => {
      return true;
    },
    persist: () => {
      /* empty for test*/
    },
    timeStamp: 0,
    type: '',
  };
};

const mockGestureEvent: GestureResponderEvent = createMockEvent({
  changedTouches: [],
  identifier: '',
  locationX: 0,
  locationY: 0,
  pageX: 0,
  pageY: 0,
  target: '',
  timestamp: 0,
  touches: [],
});

const mockKeyPressEvent: KeyPressEvent = createMockEvent({
  key: 'enter',
});

const mockAccessibilityEvent: AccessibilityActionEvent = createMockEvent({
  actionName: 'longpress',
});

describe('InteractionEvent type guard tests', () => {
  it('has correct output from isGestureResponderEvent when input is type GestureResponderEvent', () => {
    expect(isGestureResponderEvent(mockGestureEvent)).toBeTruthy();
  });

  it('has correct output from isGestureResponderEvent when input is not type GestureResponderEvent', () => {
    expect(isGestureResponderEvent(mockAccessibilityEvent)).toBeFalsy();
  });

  it('has correct output from isKeyPressEvent when input is type KeyPressEvent', () => {
    expect(isKeyPressEvent(mockKeyPressEvent)).toBeTruthy();
  });

  it('has correct output from isKeyPressEvent when input is not type KeyPressEvent', () => {
    expect(isKeyPressEvent(mockGestureEvent)).toBeFalsy();
  });

  it('has correct output from isAccessibilityActionEvent when input is type AccessibilityActionEvent', () => {
    expect(isAccessibilityActionEvent(mockAccessibilityEvent)).toBeTruthy();
  });

  it('has correct output from isAccessibilityActionEvent when input is not type AccessibilityActionEvent', () => {
    expect(isAccessibilityActionEvent(mockGestureEvent)).toBeFalsy();
  });
});
