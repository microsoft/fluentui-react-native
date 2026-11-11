/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, View } from 'react-native';
import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { useSlot } from '../component-patterns/useSlot';
import type { PropsWithRefOf } from '../types/props.types';
import { useFocusablePressable } from './useFocusablePressable';
import type { FocusablePressableOptions, FocusablePressableProps, FocusKeyboardEvent } from './useFocusablePressable';
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

  function render(
    props: FocusablePressableProps = {},
    userRef?: React.Ref<React.ComponentRef<typeof View>>,
    inlineFocusRef = false,
    options?: FocusablePressableOptions,
  ) {
    const instance = { focus: jest.fn() };
    const bindings: FocusTargetBinding[] = [];
    let pressed = false;
    function Probe({ input }: { input: FocusablePressableProps }) {
      const [native, state, binding] = useFocusablePressable(input, options);
      pressed = state.pressed;
      bindings.push(binding);
      const rootProps: PropsWithRefOf<typeof View> = { ...native, children: null, style: undefined, ref: userRef };
      const Root = useSlot(View, rootProps);
      return (
        <Root
          ref={inlineFocusRef ? (node) => binding.focusTargetRef(node) : binding.focusTargetRef}
          testID={state.focused ? 'focused' : 'blurred'}
        />
      );
    }
    act(() => {
      tree = create(<Probe input={props} />, { createNodeMock: () => instance });
    });
    return {
      instance,
      bindings,
      isPressed: () => pressed,
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

  it.each<[string, FocusablePressableOptions['pointerFocus'], boolean]>([
    ['macos', 'always', true],
    ['windows', 'never', false],
    ['win32', 'never', false],
    ['macos', 'never', false],
  ])('on %s applies the explicit %s pointer-focus mode', (platform, pointerFocus, focuses) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const subject = render({ onPress: jest.fn() }, undefined, false, { pointerFocus });
    const requestFocus = jest.spyOn(subject.bindings[0].focusTarget, 'requestFocus');
    act(() => subject.props().onPress({ target: 1, currentTarget: 1, nativeEvent: { target: 1 } }));
    expect(requestFocus.mock.calls).toEqual(focuses ? [['pointer']] : []);
    requestFocus.mockClear();
    act(() => subject.props().onPress(keyboardEvent('Enter')));
    expect(requestFocus).not.toHaveBeenCalled();
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

  it.each(['windows', 'win32', 'macos'])('keeps a disabled-focusable %s target registered while refusing activation', (platform) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onLongPress = jest.fn();
    const onAccessibilityTap = jest.fn();
    const onAccessibilityAction = jest.fn();
    const props = {
      focusable: true,
      onPress,
      onPressIn,
      onLongPress,
      onAccessibilityTap,
      onAccessibilityAction,
      accessibilityState: { busy: true },
      'aria-disabled': false,
    };
    const subject = render(props, undefined, false, { disabledFocusable: true });
    act(() => subject.props().onFocus({ target: 1, currentTarget: 1 }));
    const generation = subject.bindings[0].focusTarget.generation;
    subject.update({ ...props, disabled: true });
    expect(subject.props().testID).toBe('focused');
    expect(subject.props().focusable).toBe(true);
    expect(subject.props().disabled).toBe(platform === 'macos' ? undefined : true);
    expect(subject.props()['aria-disabled']).toBe(true);
    expect(subject.props().accessibilityState).toEqual({ disabled: true, busy: true });
    expect(subject.bindings[0].focusTarget.generation).toBe(generation);
    act(() => {
      subject.props().onPress({ nativeEvent: {} });
      subject.props().onPressIn({ nativeEvent: {} });
      subject.props().onLongPress({ nativeEvent: {} });
      subject.props().onAccessibilityTap();
    });
    const key = keyboardEvent('Enter', { code: 'Unidentified' });
    act(() => subject.props().onKeyDown(key));
    expect(key.defaultPrevented).toBe(true);
    act(() => subject.props().onKeyUp(keyboardEvent('Enter', { code: 'Unidentified' })));
    expect(onPress).not.toHaveBeenCalled();
    expect(onPressIn).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
    expect(onAccessibilityTap).not.toHaveBeenCalled();
    expect(subject.isPressed()).toBe(false);
    const action = { nativeEvent: { actionName: 'custom' } };
    act(() => subject.props().onAccessibilityAction(action));
    expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
    expect(onAccessibilityAction).toHaveBeenCalledWith(action);
  });

  it('does not make explicitly nonfocusable disabled targets eligible', () => {
    const subject = render({ disabled: true, focusable: false }, undefined, false, { disabledFocusable: true });
    expect(subject.props().focusable).toBe(false);
    expect(subject.bindings[0].focusTarget.requestFocus('keyboard').status).toBe('not-focusable');
  });

  it('forwards enabled long-press and accessibility-tap callbacks once', () => {
    const onLongPress = jest.fn();
    const onAccessibilityTap = jest.fn();
    const subject = render({ onLongPress, onAccessibilityTap }, undefined, false, { disabledFocusable: true });
    const event = { nativeEvent: {} };
    act(() => {
      subject.props().onLongPress(event);
      subject.props().onAccessibilityTap();
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledWith(event);
    expect(onAccessibilityTap).toHaveBeenCalledTimes(1);
  });

  it('preserves the native accessibility-tap event for the owning activation handler', () => {
    const onAccessibilityTap = jest.fn();
    const subject = render({ onAccessibilityTap });
    const event = { nativeEvent: { target: 1 }, target: 1, currentTarget: 1 };
    act(() => subject.props().onAccessibilityTap(event));
    expect(onAccessibilityTap).toHaveBeenCalledTimes(1);
    expect(onAccessibilityTap).toHaveBeenCalledWith(event);
    subject.update({ disabled: true, onAccessibilityTap });
    act(() => subject.props().onAccessibilityTap(event));
    expect(onAccessibilityTap).toHaveBeenCalledTimes(1);
  });

  it('does not add native activation handlers or disabled state that the caller omitted', () => {
    const subject = render();
    expect(subject.props().disabled).toBeUndefined();
    expect(subject.props().onLongPress).toBeUndefined();
    expect(subject.props().onAccessibilityTap).toBeUndefined();
  });

  it.each(['windows', 'win32', 'macos'])('finishes a disabled-focusable %s keyboard press only once when disabled', (platform) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const onPress = jest.fn();
    const onPressOut = jest.fn();
    const subject = render({ onPress, onPressOut }, undefined, false, { disabledFocusable: true });
    const down = keyboardEvent(' ');
    act(() => {
      subject.props().onKeyDown(down);
      subject.props().onPressIn(down);
    });
    expect(subject.isPressed()).toBe(true);
    subject.update({ disabled: true, onPress, onPressOut });
    expect(subject.isPressed()).toBe(false);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    act(() => {
      subject.props().onKeyUp(keyboardEvent(' '));
      subject.props().onPressOut(keyboardEvent(' '));
    });
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
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

  it.each(['Enter', ' '])('owns one complete Win32 fallback lifecycle for held %p without manufacturing a touch event', (key) => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    const calls: string[] = [];
    const onPressIn = jest.fn(() => calls.push('in'));
    const onPressOut = jest.fn(() => calls.push('out'));
    const onPress = jest.fn(() => calls.push('press'));
    const subject = render({ onPressIn, onPressOut, onPress });
    const down = { ...keyboardEvent(key, { code: 'Unidentified' }), persist: jest.fn() };
    act(() => subject.props().onKeyDown(down));
    expect(subject.isPressed()).toBe(true);
    expect(down.persist).toHaveBeenCalledTimes(1);
    expect(onPressIn).toHaveBeenCalledWith(down);
    const repeat = keyboardEvent(key, { code: 'Unidentified' });
    act(() => subject.props().onKeyDown(repeat));
    expect(repeat.defaultPrevented).toBe(true);
    expect(calls).toEqual(['in']);
    const up = keyboardEvent(key, { code: 'Unidentified' });
    act(() => subject.props().onKeyUp(up));
    expect(up.defaultPrevented).toBe(true);
    expect(subject.isPressed()).toBe(false);
    expect(calls).toEqual(['in', 'out', 'press']);
    expect(onPressOut).toHaveBeenCalledWith(up);
    expect(onPress).toHaveBeenCalledWith(up);
    act(() => {
      subject.props().onPressOut(up);
      subject.props().onKeyUp(keyboardEvent(key, { code: 'Unidentified' }));
    });
    expect(calls).toEqual(['in', 'out', 'press']);
  });

  it('retains the Win32 fallback owner when the release code becomes recognized', () => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const onPress = jest.fn();
    const subject = render({ onPressIn, onPressOut, onPress });
    act(() => subject.props().onKeyDown(keyboardEvent(' ', { code: 'Unidentified' })));
    const up = keyboardEvent(' ');
    act(() => subject.props().onKeyUp(up));
    expect(up.defaultPrevented).toBe(true);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledWith(up);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(subject.isPressed()).toBe(false);
  });

  it('leaves recognized Win32 press-in, release and activation to native Pressability', () => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const onPress = jest.fn();
    const subject = render({ onPressIn, onPressOut, onPress });
    const down = keyboardEvent(' ');
    act(() => subject.props().onKeyDown(down));
    expect(onPressIn).not.toHaveBeenCalled();
    act(() => subject.props().onPressIn(down));
    const up = keyboardEvent(' ');
    act(() => subject.props().onKeyUp(up));
    expect(up.defaultPrevented).toBe(false);
    expect(onPressOut).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
    act(() => {
      subject.props().onPressOut(up);
      subject.props().onPress(up);
    });
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(subject.isPressed()).toBe(false);
  });

  it.each(['blur', 'disable', 'intervening key', 'cancelled release'] as const)(
    'cleans up a Win32 fallback press once after %s without a stale activation',
    (cancellation) => {
      jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
      const onPressIn = jest.fn();
      const onPressOut = jest.fn();
      const onPress = jest.fn();
      const props = { onPressIn, onPressOut, onPress };
      const subject = render(props);
      act(() => subject.props().onKeyDown(keyboardEvent(' ', { code: 'Unidentified' })));
      expect(subject.isPressed()).toBe(true);
      if (cancellation === 'blur') {
        act(() => subject.props().onBlur({ target: 1, currentTarget: 1 }));
      } else if (cancellation === 'disable') {
        subject.update({ ...props, disabled: true });
        subject.update(props);
      } else if (cancellation === 'intervening key') {
        act(() => subject.props().onKeyDown(keyboardEvent('x')));
      }
      const up = keyboardEvent(' ', { code: 'Unidentified' });
      if (cancellation === 'cancelled release') up.preventDefault();
      act(() => subject.props().onKeyUp(up));
      expect(up.defaultPrevented).toBe(true);
      expect(onPressIn).toHaveBeenCalledTimes(1);
      expect(onPressOut).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();
      expect(subject.isPressed()).toBe(false);
      act(() => {
        subject.props().onPressOut(up);
        subject.props().onKeyUp(keyboardEvent(' ', { code: 'Unidentified' }));
      });
      expect(onPressOut).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();
    },
  );

  it.each(['windows', 'win32'])('ends a cancelled %s native keyboard press without activating it', (platform) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const onPress = jest.fn();
    const onPressOut = jest.fn();
    const subject = render({ onPress, onPressOut });
    const down = keyboardEvent(' ');
    act(() => subject.props().onKeyDown(down));
    act(() => subject.props().onPressIn(down));
    expect(subject.isPressed()).toBe(true);
    act(() => subject.props().onKeyDown(keyboardEvent('x')));
    expect(subject.isPressed()).toBe(false);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    const up = keyboardEvent(' ');
    act(() => subject.props().onKeyUp(up));
    expect(up.defaultPrevented).toBe(true);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('ends pressed feedback when the native target detaches without a blur event', async () => {
    jest.replaceProperty(Platform, 'OS', 'macos');
    const onPressOut = jest.fn();
    const subject = render({ onPressOut });
    const down = keyboardEvent(' ');
    act(() => subject.props().onKeyDown(down));
    act(() => subject.props().onPressIn(down));
    expect(subject.isPressed()).toBe(true);
    await act(async () => {
      subject.bindings[0].focusTargetRef(null);
    });
    expect(subject.isPressed()).toBe(false);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    const up = keyboardEvent(' ');
    act(() => subject.props().onKeyUp(up));
    expect(up.defaultPrevented).toBe(true);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it('rejects a stale Win32 activation before deferred detach notification', async () => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    const onPress = jest.fn();
    const onPressOut = jest.fn();
    const subject = render({ onPress, onPressOut });
    const down = keyboardEvent('Enter', { code: 'Unidentified' });
    act(() => subject.props().onKeyDown(down));
    expect(subject.isPressed()).toBe(true);
    await act(async () => {
      subject.bindings[0].focusTargetRef(null);
      const up = keyboardEvent('Enter', { code: 'Unidentified' });
      subject.props().onKeyUp(up);
      expect(up.defaultPrevented).toBe(true);
      expect(onPress).not.toHaveBeenCalled();
    });
    expect(subject.isPressed()).toBe(false);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledWith(down);
  });

  it.each(['windows', 'win32', 'macos'])('preserves a %s keyboard press through same-instance inline-ref handoffs', (platform) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const onPressOut = jest.fn();
    const subject = render({ onPressOut }, undefined, true);
    const target = subject.bindings[0].focusTarget;
    const generation = target.generation;
    act(() => subject.props().onFocus({ target: 1, currentTarget: 1 }));
    const down = keyboardEvent(' ');
    act(() => subject.props().onKeyDown(down));
    act(() => subject.props().onPressIn(down));
    subject.update({ onPressOut });
    expect(target.generation).toBe(generation);
    expect(target.getSnapshot().focused).toBe(true);
    expect(subject.isPressed()).toBe(true);
    expect(onPressOut).not.toHaveBeenCalled();
    const up = keyboardEvent(' ');
    act(() => subject.props().onKeyUp(up));
    expect(up.defaultPrevented).toBe(false);
    act(() => subject.props().onPressOut(up));
    expect(subject.isPressed()).toBe(false);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });
});
