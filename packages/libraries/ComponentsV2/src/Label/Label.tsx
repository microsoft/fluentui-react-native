import * as React from 'react';
import {StyleSheet, Text} from 'react-native';
import type {TextProps} from 'react-native';

export interface LabelProps extends TextProps {
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  weight?: 'regular' | 'semibold';
}

export function Label({children, disabled, required, size = 'medium', style, weight = 'semibold', ...props}: LabelProps): React.ReactElement {
  return <Text {...props} style={[styles.label, styles[size], weight === 'semibold' && styles.semibold, disabled && styles.disabled, style]}>{children}{required ? ' *' : ''}</Text>;
}

const styles = StyleSheet.create({
  disabled: {color: '#bdbdbd'},
  label: {color: '#242424'},
  large: {fontSize: 16},
  medium: {fontSize: 14},
  semibold: {fontWeight: '600'},
  small: {fontSize: 12},
});
