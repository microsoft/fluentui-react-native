/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, View } from 'react-native';
import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { useSlot } from '../component-patterns/useSlot';
import type { PropsWithRefOf } from '../types/props.types';
import { useFocusablePressable } from './useFocusablePressable';
import type { FocusablePressableProps, FocusKeyboardEvent } from './useFocusablePressable';
import type { FocusTargetBinding } from './useFocusTarget';

function keyboardEvent(key: string, extras: Partial<FocusKeyboardEvent['nativeEvent']> = {}) {
  return {
    nativeEvent: { key, code: key === ' ' ? 'Space' : key, ...extras },
    target: 1,
    currentTarget: 1,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation: jest.fn(),
  };
}

function hasFocus(instance: object | null): instance is { focus(): void } {
  return instance !== null && 'focus' in instance && typeof instance.focus === 'function';
}

describe('focusable pressable', () => {
  let tree: ReactTestRenderer | undefined;
  afterEach(() => {
    act(() => tree?.unmount());
    jest.restoreAllMocks();
  });

  function render(props: FocusablePressableProps = {}, userRef?: React.Ref<React.ComponentRef<typeof View>>) {
    const instance = { focus: jest.fn() };
    const bindings: FocusTargetBinding[] = [];
    function Probe({ input }: { input: FocusablePressableProps }) {
      const [native, state, binding] = useFocusablePressable(input);
      bindings.push(binding);
      const rootProps: PropsWithRefOf<typeof View> = { ...native, children: null, style: undefined, ref: userRef };
      const Root = useSlot(View, rootProps);
      return <Root ref={binding.focusTargetRef} testID={state.focused ? 'focused' : 'blurred'} />;
    }
    act(() => {
      tree = create(<Probe input={props} />, { createNodeMock: () => instance });
    });
    return {
      instance,
      bindings,
      props: () => tree!.root.findByType(View).props,
      update: (next: FocusablePressableProps) => act(() => tree!.update(<Probe input={next} />)),
    };
  }

  it.each(['windows', 'win32', 'macos'])('uses the %s pointer-focus policy and accepts responder children', (platform) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const calls: string[] = [];
    const subject = render({ onPress: () => calls.push('press') });
    const instance = subject.bindings[0].focusTarget.current;
    if (!hasFocus(instance)) {
      throw new Error('Expected a mounted focusable native mock.');
    }
    jest.spyOn(instance, 'focus').mockImplementation(() => {
      calls.push('focus');
    });
    act(() => subject.props().onPress({ target: 2, currentTarget: 1, nativeEvent: { target: 2 } }));
    expect(calls).toEqual(platform === 'macos' ? ['press'] : ['focus', 'press']);
  });

  it('preserves callback refs and ignores descendant focus while forwarding handlers', () => {
    const cleanup = jest.fn();
    const ref = jest.fn(() => cleanup);
    const onFocus = jest.fn();
    const subject = render({ onFocus }, ref);
    act(() => subject.props().onFocus({ target: 2, currentTarget: 1 }));
    expect(subject.props().testID).toBe('blurred');
    expect(onFocus).toHaveBeenCalledTimes(1);
    act(() => subject.props().onFocus({ target: 1, currentTarget: 1 }));
    expect(subject.props().testID).toBe('focused');
    subject.update({ onFocus });
    expect(ref).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(subject.bindings[0].focusTarget.current).toBeNull();
  });

  it('clears focus on disable and honors nonfocusable targets without activating disabled controls', () => {
    const press = jest.fn();
    const subject = render({ onPress: press });
    act(() => subject.props().onFocus({ target: 1, currentTarget: 1 }));
    subject.update({ disabled: true, focusable: true, onPress: press });
    expect(subject.props().testID).toBe('blurred');
    expect(subject.props().focusable).toBe(false);
    act(() => subject.props().onPress({ nativeEvent: {} }));
    expect(press).not.toHaveBeenCalled();
    subject.update({ onPress: press });
    expect(subject.props().testID).toBe('blurred');
  });

  it('guards repeats, chords, descendant activation, and unmatched key-up without synthesizing presses', () => {
    jest.replaceProperty(Platform, 'OS', 'windows');
    const onPress = jest.fn();
    const subject = render({ onPress });
    const first = keyboardEvent('Enter');
    act(() => subject.props().onKeyDown(first));
    expect(first.defaultPrevented).toBe(false);
    const repeat = keyboardEvent('Enter');
    act(() => subject.props().onKeyDown(repeat));
    expect(repeat.defaultPrevented).toBe(true);
    const up = keyboardEvent('Enter');
    act(() => subject.props().onKeyUp(up));
    expect(up.defaultPrevented).toBe(false);
    const unmatched = keyboardEvent('Enter');
    act(() => subject.props().onKeyUp(unmatched));
    expect(unmatched.defaultPrevented).toBe(true);
    const chord = keyboardEvent('Enter', { ctrlKey: true });
    act(() => subject.props().onKeyDown(chord));
    expect(chord.defaultPrevented).toBe(true);
    const child = { ...keyboardEvent('Enter'), target: 2 };
    act(() => subject.props().onKeyDown(child));
    expect(child.defaultPrevented).toBe(true);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('cancels keyboard pairing on blur and preserves original callbacks', () => {
    const down = jest.fn();
    const up = jest.fn();
    const blur = jest.fn();
    const subject = render({ onKeyDown: down, onKeyUp: up, onBlur: blur });
    act(() => subject.props().onKeyDown(keyboardEvent(' ')));
    act(() => subject.props().onBlur({ target: 1, currentTarget: 1 }));
    const event = keyboardEvent(' ');
    act(() => subject.props().onKeyUp(event));
    expect(event.defaultPrevented).toBe(true);
    expect(down).toHaveBeenCalledTimes(1);
    expect(up).toHaveBeenCalledTimes(1);
    expect(blur).toHaveBeenCalledTimes(1);
  });

  it('activates paired Win32 keys with an unidentified code, but leaves recognized codes to native', () => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    const onPress = jest.fn();
    const subject = render({ onPress });
    act(() => subject.props().onKeyDown(keyboardEvent('Enter', { code: 'Unidentified' })));
    const keyUp = keyboardEvent('Enter', { code: 'Unidentified' });
    act(() => subject.props().onKeyUp(keyUp));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(keyUp);
    expect(keyUp.defaultPrevented).toBe(true);
    act(() => subject.props().onKeyUp(keyboardEvent('Enter', { code: 'Unidentified' })));
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => subject.props().onKeyDown(keyboardEvent('Enter')));
    act(() => subject.props().onKeyUp(keyboardEvent('Enter')));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
