import * as React from 'react';
import * as RN from 'react-native';

export type ChangeCallback<TValue, TEvent> = (ev: TEvent, newValue?: TValue) => void;

/**
 * Hook to initialize and return a constant value. Unlike `React.useMemo`, this is guaranteed to
 * always return the same value (and if the initializer is a function, only call it once).
 * This is similar to setting a private member in a class constructor.
 *
 * If the value should ever change based on dependencies, use `React.useMemo` instead.
 *
 * @param initialValue - Initial value, or function to get the initial value. Similar to `useState`,
 * only the value/function passed in the first time this is called is respected.
 * @returns The value. The identity of this value will always be the same.
 */
export function useConst<T>(initialValue: T | (() => T)): T {
  // Use useRef to store the value because it's the least expensive built-in hook that works here
  // (we could also use `const [value] = React.useState(initialValue)` but that's more expensive
  // internally due to reducer handling which we don't need)
  const ref = React.useRef<{ value: T }>();
  if (ref.current === undefined) {
    // Box the value in an object so we can tell if it's initialized even if the initializer
    // returns/is undefined
    ref.current = {
      value: typeof initialValue === 'function' ? (initialValue as Function)() : initialValue,
    };
  }
  return ref.current.value;
}

// export function useControllableValue<TValue>(
//   controlledValue?: TValue,
//   defaultUncontrolledValue?: TValue,
// ): [TValue | undefined, (update: React.SetStateAction<TValue | undefined>) => void];

export function useControllableValue<TValue, TEvent>(
  controlledValue?: TValue,
  defaultUncontrolledValue?: TValue,
  onChange?: ChangeCallback<TValue, TEvent>,
) {
  const [value, setValue] = React.useState<TValue | undefined>(defaultUncontrolledValue);
  const isControlled = useConst<boolean>(controlledValue !== undefined);
  const currentValue = isControlled ? controlledValue : value;

  // Duplicate the current value and onChange in refs so they're accessible from
  // setValueOrCallOnChange without creating a new callback every time
  const valueRef = React.useRef(currentValue);
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    valueRef.current = currentValue;
    onChangeRef.current = onChange;
  });

  // To match the behavior of the setter returned by React.useState, this callback's identity
  // should never change. This means it MUST NOT directly reference variables that can change.
  const setValueOrCallOnChange = useConst(() => (update: React.SetStateAction<TValue | undefined>, ev?: TEvent) => {
    // Assuming here that TValue is not a function, because a controllable value will typically
    // be something a user can enter as input
    const newValue = typeof update === 'function' ? (update as Function)(valueRef.current) : update;

    if (onChangeRef.current) {
      onChangeRef.current(ev!, newValue);
    }

    if (!isControlled) {
      setValue(newValue);
    }
  });

  return [currentValue, setValueOrCallOnChange] as const;
}
export function useAsToggle(
  defaultChecked?: boolean,
  checked?: boolean,
  userCallback?: ChangeCallback<boolean, RN.NativeSyntheticEvent<any>>,
): [boolean, () => void] {
  const [isChecked, setChecked] = useControllableValue(checked, defaultChecked, userCallback);
  const toggle = React.useCallback(() => {
    setChecked(!isChecked);
  }, [isChecked, setChecked]);

  return [isChecked, toggle];
}
