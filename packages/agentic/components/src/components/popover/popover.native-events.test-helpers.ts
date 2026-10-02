import type { NativeMethods, NativeSyntheticEvent } from 'react-native';

export function nativeEvent<T extends object>(payload: T): NativeSyntheticEvent<T> {
  const target: NativeMethods = {
    focus: jest.fn(),
    blur: jest.fn(),
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    setNativeProps: jest.fn(),
  };
  return {
    nativeEvent: payload,
    currentTarget: target,
    target,
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: 0,
    type: 'test',
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: jest.fn(),
  };
}
