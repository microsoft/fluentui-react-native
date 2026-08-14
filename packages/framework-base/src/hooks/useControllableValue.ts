import * as React from 'react';

export type ControllableValueChangeCallback<TValue> = (nextValue: TValue | undefined) => void;

type ValueUpdater<TValue> = React.SetStateAction<TValue | undefined>;

/**
 * Tracks a value that may switch between controlled and uncontrolled over time.
 *
 * The returned setter accepts either a value or an updater function and always calls the provided callback with the
 * resolved next value. When the hook is uncontrolled, the internal value updates too.
 */
export function useControllableValue<TValue>(
  controlledValue: TValue | undefined,
  defaultValue: TValue | undefined,
  onChange?: ControllableValueChangeCallback<TValue>,
): readonly [TValue | undefined, (update: ValueUpdater<TValue>) => void] {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<TValue | undefined>(() => defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const valueRef = React.useRef<TValue | undefined>(value);
  const controlledRef = React.useRef(isControlled);
  const onChangeRef = React.useRef(onChange);
  valueRef.current = value;
  controlledRef.current = isControlled;
  onChangeRef.current = onChange;

  React.useEffect(() => {
    if (isControlled) {
      setUncontrolledValue(controlledValue);
    }
  }, [controlledValue, isControlled]);

  const setValue = React.useCallback((update: ValueUpdater<TValue>) => {
    const nextValue =
      typeof update === 'function' ? (update as (prevState: TValue | undefined) => TValue | undefined)(valueRef.current) : update;
    onChangeRef.current?.(nextValue);

    if (!controlledRef.current) {
      valueRef.current = nextValue;
      setUncontrolledValue(nextValue);
    }
  }, []);

  return [value, setValue] as const;
}
