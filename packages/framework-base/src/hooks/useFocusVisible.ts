import * as React from 'react';
import type { PressableProps } from 'react-native';

export type FocusVisibleKeyEvent = {
  nativeEvent?: {
    key?: string;
  };
};

export type FocusVisiblePressableProps = PressableProps & {
  onKeyDown?: (event: FocusVisibleKeyEvent) => void;
};

export type UseFocusVisibleResult = [props: FocusVisiblePressableProps, focusVisible: boolean];

/**
 * Tracks whether focus should be represented as keyboard focus while preserving
 * the native handlers supplied by the caller.
 */
export function useFocusVisible(props: FocusVisiblePressableProps): UseFocusVisibleResult {
  const [focusVisible, setFocusVisible] = React.useState(false);
  const focused = React.useRef(false);
  const pointerActive = React.useRef(false);
  const { onBlur, onFocus, onKeyDown, onPressIn, onPressOut } = props;

  const overrides = React.useMemo<FocusVisiblePressableProps>(
    () => ({
      onBlur: (event) => {
        focused.current = false;
        pointerActive.current = false;
        setFocusVisible(false);
        onBlur?.(event);
      },
      onFocus: (event) => {
        focused.current = true;
        setFocusVisible(!pointerActive.current);
        onFocus?.(event);
      },
      onKeyDown: (event) => {
        pointerActive.current = false;
        if (focused.current) {
          setFocusVisible(true);
        }
        onKeyDown?.(event);
      },
      onPressIn: (event) => {
        pointerActive.current = true;
        setFocusVisible(false);
        onPressIn?.(event);
      },
      onPressOut: (event) => {
        pointerActive.current = false;
        onPressOut?.(event);
      },
    }),
    [onBlur, onFocus, onKeyDown, onPressIn, onPressOut],
  );

  return [{ ...props, ...overrides }, focusVisible];
}
