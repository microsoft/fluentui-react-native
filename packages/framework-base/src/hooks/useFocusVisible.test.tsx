import { act } from 'react';
import * as renderer from 'react-test-renderer';

import { useFocusVisible } from './useFocusVisible';
import type { FocusVisiblePressableProps, UseFocusVisibleResult } from './useFocusVisible';

function renderFocusVisible(props: FocusVisiblePressableProps = {}) {
  const latest: { current: UseFocusVisibleResult } = { current: undefined as unknown as UseFocusVisibleResult };
  const Harness = () => {
    latest.current = useFocusVisible(props);
    return null;
  };

  act(() => {
    renderer.create(<Harness />);
  });

  return {
    get props() {
      return latest.current[0];
    },
    get focusVisible() {
      return latest.current[1];
    },
  };
}

const event = {} as never;

describe('useFocusVisible', () => {
  it('shows focus for keyboard or programmatic focus', () => {
    const result = renderFocusVisible();

    act(() => result.props.onFocus?.(event));

    expect(result.focusVisible).toBe(true);
  });

  it('suppresses focus after a pointer press and restores it after keyboard input', () => {
    const result = renderFocusVisible();

    act(() => result.props.onPressIn?.(event));
    act(() => result.props.onFocus?.(event));
    expect(result.focusVisible).toBe(false);

    act(() => result.props.onKeyDown?.(event));
    expect(result.focusVisible).toBe(true);
  });

  it('clears focus on blur and forwards native handlers', () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    const onKeyDown = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const result = renderFocusVisible({ onBlur, onFocus, onKeyDown, onPressIn, onPressOut });

    act(() => result.props.onFocus?.(event));
    act(() => result.props.onKeyDown?.(event));
    act(() => result.props.onPressIn?.(event));
    act(() => result.props.onPressOut?.(event));
    act(() => result.props.onBlur?.(event));

    expect(result.focusVisible).toBe(false);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });
});
