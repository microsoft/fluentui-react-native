import * as React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

/**
 * Props for the simple {@link Button} component.
 *
 * This is an intentionally minimal, plain react-native implementation used to scaffold the
 * agentic-components library, its tests, and storybook integration.
 */
export type ButtonProps = {
  /** Text label rendered inside the button. */
  title: string;
  /** Called when the button is pressed. */
  onPress?: (event: GestureResponderEvent) => void;
  /** When true, the button is non-interactive and rendered in a dimmed state. */
  disabled?: boolean;
  /** Optional style override applied to the pressable root. */
  style?: StyleProp<ViewStyle>;
};

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
export function Button(props: ButtonProps): React.JSX.Element {
  const { title, onPress, disabled, style } = props;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{title}</Text>
    </Pressable>
  );
}
Button.displayName = 'Button';

export default Button;
