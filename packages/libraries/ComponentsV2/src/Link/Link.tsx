import * as React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import type {GestureResponderEvent, TextStyle} from 'react-native';

export interface LinkProps {
  appearance?: 'default' | 'subtle';
  children?: React.ReactNode;
  disabled?: boolean;
  disabledFocusable?: boolean;
  inline?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: TextStyle;
}

export function Link({appearance = 'default', children, disabled, disabledFocusable, inline, onPress, style}: LinkProps): React.ReactElement {
  return (
    <Pressable accessibilityRole="link" accessibilityState={{disabled}} disabled={disabled && !disabledFocusable} onPress={disabled ? undefined : onPress} style={inline ? styles.inline : undefined}>
      <Text style={[styles.link, appearance === 'subtle' && styles.subtle, disabled && styles.disabled, style]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: {color: '#bdbdbd', textDecorationLine: 'none'},
  inline: {alignSelf: 'flex-start'},
  link: {color: '#0f6cbd', textDecorationLine: 'underline'},
  subtle: {color: '#424242'},
});
