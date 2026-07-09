import * as React from 'react';
import { act } from 'react';
import * as renderer from 'react-test-renderer';
import type { PressableProps } from 'react-native';

import { usePressableState } from './usePressableState';
import type { UsePressableResult } from './usePressableState';
import type { PressableState } from '../types/interactive.types';

/**
 * Render harness that runs usePressableState in a component and exposes the latest result so tests can
 * inspect the returned props/state and fire the augmented event handlers. usePressableState returns a
 * [props, state] tuple; the getters below always read the most recent tuple after a re-render.
 */
function renderPressableState(props: PressableProps = {}, stateKeys?: (keyof PressableState)[]) {
  const latest: { current: UsePressableResult } = { current: undefined as unknown as UsePressableResult };
  const Harness: React.FunctionComponent = () => {
    latest.current = usePressableState(props, stateKeys);
    return null;
  };
  act(() => {
    renderer.create(<Harness />);
  });
  return {
    get props(): PressableProps {
      return latest.current[0];
    },
    get state(): PressableState {
      return latest.current[1];
    },
  };
}

// events are opaque to the hook, so a cast placeholder is sufficient
const evt = {} as never;

describe('usePressableState', () => {
  it('returns a [props, state] tuple', () => {
    const latest: { current: UsePressableResult } = { current: undefined as unknown as UsePressableResult };
    const Harness: React.FunctionComponent = () => {
      latest.current = usePressableState({});
      return null;
    };
    act(() => {
      renderer.create(<Harness />);
    });
    expect(Array.isArray(latest.current)).toBe(true);
    expect(latest.current).toHaveLength(2);
    const [props, state] = latest.current;
    expect(typeof props.onPressIn).toBe('function');
    expect(state).toEqual({ pressed: false, hovered: false, focused: false });
  });

  it('tracks all three states by default, starting false', () => {
    const result = renderPressableState();
    // state is seeded to false for every tracked key
    expect(result.state).toEqual({ pressed: false, hovered: false, focused: false });
    // handlers for all three states are wired
    expect(typeof result.props.onPressIn).toBe('function');
    expect(typeof result.props.onHoverIn).toBe('function');
    expect(typeof result.props.onFocus).toBe('function');
  });

  it('toggles pressed on press in/out', () => {
    const result = renderPressableState();
    act(() => result.props.onPressIn?.(evt));
    expect(result.state.pressed).toBe(true);
    act(() => result.props.onPressOut?.(evt));
    expect(result.state.pressed).toBe(false);
  });

  it('toggles hovered on hover in/out', () => {
    const result = renderPressableState();
    act(() => result.props.onHoverIn?.(evt));
    expect(result.state.hovered).toBe(true);
    act(() => result.props.onHoverOut?.(evt));
    expect(result.state.hovered).toBe(false);
  });

  it('toggles focused on focus/blur', () => {
    const result = renderPressableState();
    act(() => result.props.onFocus?.(evt));
    expect(result.state.focused).toBe(true);
    act(() => result.props.onBlur?.(evt));
    expect(result.state.focused).toBe(false);
  });

  it('forwards the original handlers supplied in props', () => {
    const onPressIn = jest.fn();
    const onHoverIn = jest.fn();
    const onFocus = jest.fn();
    const result = renderPressableState({ onPressIn, onHoverIn, onFocus });
    act(() => result.props.onPressIn?.(evt));
    act(() => result.props.onHoverIn?.(evt));
    act(() => result.props.onFocus?.(evt));
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(result.state).toEqual({ pressed: true, hovered: true, focused: true });
  });

  it('only tracks the requested state keys', () => {
    const result = renderPressableState({}, ['pressed']);
    // state is seeded to false only for the requested keys
    expect(result.state).toEqual({ pressed: false });
    // only pressed handlers are wired; hover/focus handlers are not added
    expect(typeof result.props.onPressIn).toBe('function');
    expect(result.props.onHoverIn).toBeUndefined();
    expect(result.props.onFocus).toBeUndefined();

    act(() => result.props.onPressIn?.(evt));
    expect(result.state).toEqual({ pressed: true });
    expect('hovered' in result.state).toBe(false);
    expect('focused' in result.state).toBe(false);
  });

  it('passes untracked handlers through without wrapping (no state added)', () => {
    const onHoverIn = jest.fn();
    // only track pressed, so hovered handlers should be the originals and hovered state should not appear
    const result = renderPressableState({ onHoverIn }, ['pressed']);
    expect(result.props.onHoverIn).toBe(onHoverIn);
    act(() => result.props.onHoverIn?.(evt));
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect('hovered' in result.state).toBe(false);
  });

  it('preserves non-event props on the augmented props', () => {
    const result = renderPressableState({ accessibilityLabel: 'test', disabled: true });
    expect(result.props.accessibilityLabel).toBe('test');
    expect(result.props.disabled).toBe(true);
  });
});
