import { act } from 'react';
import { Platform, Pressable } from 'react-native';

import * as renderer from 'react-test-renderer';

import { useKeyDownProps, useKeyProps, useKeyUpProps } from '../useKeyProps';
import type { KeyPressEvent } from '../useKeyProps.types';
import type { PressablePropsExtended } from '../usePressableState.types';

const dummyFunction = () => {
  console.log('dummy');
};

// Simple wrapper function to let us use `PressablePropsExtended` to fix type errors
const PressableWithDesktopProps = (props: PressablePropsExtended) => {
  return <Pressable {...props} />;
};

it('Pressable with useKeyProps', () => {
  const TestComponent = () => {
    const keyboardProps = useKeyProps(dummyFunction, ' ', 'Enter');
    return <PressableWithDesktopProps {...keyboardProps} />;
  };

  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<TestComponent />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});

it('useKeyProps called twice', () => {
  const TestComponent = () => {
    const keyboardProps1 = useKeyProps(dummyFunction, ' ', 'Enter');
    const keyboardProps2 = useKeyProps(dummyFunction, ' ', 'Enter');
    expect(keyboardProps1).toBe(keyboardProps2);
    return <PressableWithDesktopProps {...keyboardProps2} />;
  };

  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<TestComponent />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});

describe.each([
  { direction: 'down', useKeyEventProps: useKeyDownProps, onKeyEvent: 'onKeyDown', keyEvents: 'keyDownEvents', validKeys: 'validKeysDown' },
  { direction: 'up', useKeyEventProps: useKeyUpProps, onKeyEvent: 'onKeyUp', keyEvents: 'keyUpEvents', validKeys: 'validKeysUp' },
] as const)('key $direction props', ({ useKeyEventProps, onKeyEvent, keyEvents, validKeys }) => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // `memoize` caches the props for each set of arguments, so each call uses a new callback.
  function getKeyEventProps(os: string, reactNativeMinorVersion: number) {
    jest.replaceProperty(Platform, 'OS', os as typeof Platform.OS);
    jest.spyOn(Platform, 'constants', 'get').mockReturnValue({
      isTesting: true,
      reactNativeVersion: { major: 0, minor: reactNativeMinorVersion, patch: 0 },
    });
    const callback = jest.fn();
    return { callback, props: useKeyEventProps(callback, ' ', 'Enter') };
  }

  it.each([78, 81])(`uses ${keyEvents} on react-native-macos 0.%i`, (minor) => {
    expect(getKeyEventProps('macos', minor).props).toStrictEqual({
      [onKeyEvent]: expect.any(Function),
      [keyEvents]: [{ key: ' ' }, { key: 'Enter' }],
    });
  });

  it.each([73, 74])(`uses ${validKeys} on react-native-macos 0.%i`, (minor) => {
    expect(getKeyEventProps('macos', minor).props).toStrictEqual({
      [onKeyEvent]: expect.any(Function),
      [validKeys]: [' ', 'Enter'],
    });
  });

  it.each([74, 81])(`uses ${keyEvents} on win32 0.%i`, (minor) => {
    expect(getKeyEventProps('win32', minor).props).toStrictEqual({
      [onKeyEvent]: expect.any(Function),
      [keyEvents]: [{ key: ' ' }, { key: 'Enter' }],
    });
  });

  it(`uses only ${onKeyEvent} on react-native-windows`, () => {
    expect(getKeyEventProps('windows', 81).props).toStrictEqual({ [onKeyEvent]: expect.any(Function) });
  });

  it.each(['ios', 'android'])('returns undefined on %s', (os) => {
    expect(getKeyEventProps(os, 81).props).toBeUndefined();
  });

  it(`calls the callback from ${onKeyEvent} only for the listed keys`, () => {
    const { callback, props } = getKeyEventProps('macos', 81);
    const otherKey = { nativeEvent: { key: 'a' }, stopPropagation: jest.fn() };
    const enter = { nativeEvent: { key: 'Enter' }, stopPropagation: jest.fn() };
    props?.[onKeyEvent]?.(otherKey as unknown as KeyPressEvent);
    props?.[onKeyEvent]?.(enter as unknown as KeyPressEvent);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(enter);
    expect(otherKey.stopPropagation).not.toHaveBeenCalled();
    expect(enter.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it('returns the same props for the same arguments', () => {
    const { callback, props } = getKeyEventProps('macos', 81);
    expect(useKeyEventProps(callback, ' ', 'Enter')).toBe(props);
  });
});
