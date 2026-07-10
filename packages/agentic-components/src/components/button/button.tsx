/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { FurnJSX } from '@fluentui-react-native/framework-base';
import type { ButtonProps } from './button.types';
import { useButton_unstable } from './useButton';

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#0078d4',
  },
  pressed: {
    backgroundColor: '#005a9e',
  },
  disabled: {
    backgroundColor: '#c8c8c8',
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  labelDisabled: {
    color: '#888888',
  },
});

/**
 * A simple cross-platform button built directly on react-native primitives.
 */
export function Button(props: ButtonProps): FurnJSX.Element {
  const State = useButton_unstable(props);
  const { pressed, shape } = State;
  const disabled = Boolean(props.disabled);
  const disabledStyle = disabled ? styles.disabled : undefined;
  const pressedStyle = pressed ? styles.pressed : undefined;

  return (
    <State.root accessibilityRole="button" accessibilityState={{ disabled }} style={[styles.root, shape, pressedStyle, disabledStyle]}>
      <State.content style={[styles.label, disabled && styles.labelDisabled]} />
    </State.root>
  );
}
Button.displayName = 'Button';

export default Button;
