import * as React from 'react';

import { useControllableValue } from './useControllableValue';

/**
 * How a user interaction changes the value.
 *
 * - `toggle` flips the value on every activation, matching checkbox, switch, toggle button, and disclosure semantics.
 * - `select` only ever turns the value on, matching radio, tab, and single-select item semantics where the group owns
 *   deselection.
 */
export type ToggleActivationMode = 'toggle' | 'select';

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
   * Called with the next value whenever an activation or explicit set produces a change. This fires in both the
   * externally driven and internally driven cases so a caller can always observe state change events.
   */
  onChange?: (value: boolean) => void;

  /**
   * How `activate` derives the next value. Defaults to `toggle`.
   */
  mode?: ToggleActivationMode;

  /**
   * When true, `activate` and `setValue` are ignored so a disabled control cannot change state.
   */
  disabled?: boolean;

  /**
   * The value used when neither `value` nor `defaultValue` is supplied. Defaults to `false`.
   */
  fallbackValue?: boolean;
};

export type ToggleState = {
  /**
   * The resolved value, from props when externally driven and from internal state otherwise.
   */
  value: boolean;

  /**
   * Whether the caller opted into the state axis at all, by supplying `value`, `defaultValue`, or `onChange`. Use this
   * to gate optional semantics such as toggle-button accessibility, and preserve the distinction between an omitted and
   * a `false` controlled value.
   */
  enabled: boolean;

  /**
   * Whether the value is currently externally driven.
   */
  controlled: boolean;

  /**
   * Apply a user interaction. Respects `mode` and `disabled`, and only reports a change when the value actually moves.
   */
  activate: () => void;

  /**
   * Request an explicit value. Respects `disabled`, and only reports a change when the value actually moves.
   */
  setValue: (next: boolean) => void;
};

/**
 * Track a boolean state that supports both an externally driven caller and internally driven user interaction.
 *
 * The value is externally driven while `value` is supplied and internally driven otherwise. Either way `onChange` fires
 * with the next value so the caller can observe state change events without owning the state.
 */
export function useToggleState(options: UseToggleStateOptions): ToggleState {
  const { value: controlledValue, defaultValue, onChange, mode = 'toggle', disabled = false, fallbackValue = false } = options;

  const enabled = controlledValue !== undefined || defaultValue !== undefined || onChange !== undefined;

  // Keep the activation callbacks stable by reading changing values through a ref rather than through closures.
  const latest = React.useRef({ disabled, fallbackValue, mode, onChange, value: fallbackValue });

  const handleChange = React.useCallback((nextValue: boolean | undefined) => {
    latest.current.onChange?.(nextValue ?? latest.current.fallbackValue);
  }, []);
  const [rawValue, setControllableValue] = useControllableValue(controlledValue, defaultValue ?? fallbackValue, handleChange);
  const value = rawValue ?? fallbackValue;

  latest.current = { disabled, fallbackValue, mode, onChange, value };

  const setValue = React.useCallback(
    (next: boolean) => {
      if (latest.current.disabled || next === latest.current.value) {
        return;
      }
      setControllableValue(next);
    },
    [setControllableValue],
  );

  const activate = React.useCallback(() => {
    const current = latest.current;
    if (current.disabled) {
      return;
    }
    const next = current.mode === 'select' ? true : !current.value;
    if (next === current.value) {
      return;
    }
    setControllableValue(next);
  }, [setControllableValue]);

  return { value, enabled, controlled: controlledValue !== undefined, activate, setValue };
}
