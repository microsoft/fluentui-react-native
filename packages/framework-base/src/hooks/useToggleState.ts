import * as React from 'react';

import { useControllableValue } from './useControllableValue';

export type UseToggleStateOptions = {
  /**
   * The externally driven value. Supplying this makes the component controlled: the value only changes when the caller
   * passes a new one. `undefined` keeps the component internally driven.
   */
  value?: boolean;

  /**
   * The initial value for the internally driven case. Ignored while `value` is supplied.
   */
  defaultValue?: boolean;

  /**
   * Called with the next value whenever an interaction or explicit set produces a change. This fires in both the
   * externally driven and internally driven cases so a caller can always observe state change events.
   */
  onChange?: (value: boolean) => void;

  /**
   * When true, `toggle` and `setValue` are ignored so a disabled control cannot change state.
   */
  disabled?: boolean;
};

export type ToggleState = {
  /**
   * The resolved value, from props when externally driven and from internal state otherwise.
   */
  value: boolean;

  /**
   * Flip the value from a user interaction. Respects `disabled`.
   */
  toggle: () => void;

  /**
   * Request an explicit value. Respects `disabled`, and only reports a change when the value actually moves.
   */
  setValue: (next: boolean) => void;
};

/**
 * Track a boolean state for a control whose interaction *is* the state change, such as a checkbox, a switch, or a
 * disclosure.
 *
 * The value is externally driven while `value` is supplied and internally driven otherwise. Either way `onChange` fires
 * with the next value so the caller can observe state change events without owning the state.
 *
 * Do not use this for a control whose selection is owned by a caller or a surrounding group, such as a toggle button,
 * tab, radio, or list item. Those render the value they are given and report the interaction through `onPress`.
 */
export function useToggleState(options: UseToggleStateOptions): ToggleState {
  const { value: controlledValue, defaultValue, onChange, disabled = false } = options;

  // Keep the callbacks stable by reading changing values through a ref rather than through closures.
  const latest = React.useRef({ disabled, onChange, value: false });

  const handleChange = React.useCallback((nextValue: boolean | undefined) => {
    latest.current.onChange?.(nextValue ?? false);
  }, []);
  const [rawValue, setControllableValue] = useControllableValue(controlledValue, defaultValue ?? false, handleChange);
  const value = rawValue ?? false;

  latest.current = { disabled, onChange, value };

  const setValue = React.useCallback(
    (next: boolean) => {
      if (latest.current.disabled || next === latest.current.value) {
        return;
      }
      setControllableValue(next);
    },
    [setControllableValue],
  );

  const toggle = React.useCallback(() => {
    if (latest.current.disabled) {
      return;
    }
    setControllableValue(!latest.current.value);
  }, [setControllableValue]);

  return { value, toggle, setValue };
}
