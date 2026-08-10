import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export interface FieldProps {
  children?: React.ReactNode;
  disabled?: boolean;
  hint?: React.ReactNode;
  info?: React.ReactNode;
  label?: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  validationMessage?: React.ReactNode;
  validationState?: 'error' | 'none' | 'success' | 'warning';
}

export function Field({children, disabled, hint, info, label, orientation = 'vertical', required, size = 'medium', validationMessage, validationState = 'none'}: FieldProps): React.ReactElement {
  return (
    <View style={[styles.root, orientation === 'horizontal' && styles.horizontal, disabled && styles.disabled]}>
      <View style={styles.labelRow}>
        {typeof label === 'string' ? <Text style={[styles.label, styles[size]]}>{label}{required ? ' *' : ''}</Text> : label}
        {info ? <Text style={styles.info}>ⓘ</Text> : null}
      </View>
      <View style={styles.control}>{children}</View>
      {validationMessage ? <Text style={[styles.message, validationState === 'error' && styles.error, validationState === 'success' && styles.success]}>{validationMessage}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  control: {flex: 1},
  disabled: {opacity: 0.45},
  error: {color: '#d13438'},
  hint: {color: '#616161', fontSize: 12},
  horizontal: {alignItems: 'center', flexDirection: 'row'},
  info: {color: '#0f6cbd'},
  label: {color: '#242424', fontWeight: '600'},
  labelRow: {alignItems: 'center', flexDirection: 'row', gap: 4},
  large: {fontSize: 16},
  medium: {fontSize: 14},
  message: {fontSize: 12},
  root: {gap: 4, width: '100%'},
  small: {fontSize: 12},
  success: {color: '#107c10'},
});
