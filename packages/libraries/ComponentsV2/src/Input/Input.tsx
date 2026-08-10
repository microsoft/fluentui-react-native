import * as React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import type {TextInputProps} from 'react-native';

export interface InputProps extends TextInputProps {
  appearance?: 'outline' | 'underline' | 'filled-darker' | 'filled-lighter';
  contentAfter?: React.ReactNode;
  contentBefore?: React.ReactNode;
  disabled?: boolean;
  inline?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function Input({appearance = 'outline', contentAfter, contentBefore, disabled, inline, size = 'medium', style, ...props}: InputProps): React.ReactElement {
  return (
    <View style={[styles.root, styles[size], appearance === 'underline' && styles.underline, appearance === 'filled-darker' && styles.filledDarker, appearance === 'filled-lighter' && styles.filledLighter, inline && styles.inline, disabled && styles.disabled]}>
      {contentBefore}
      <TextInput {...props} editable={!disabled} style={[styles.input, style]} />
      {contentAfter}
    </View>
  );
}

const styles = StyleSheet.create({
  filledDarker: {backgroundColor: '#e0e0e0'},
  filledLighter: {backgroundColor: '#f5f5f5'},
  disabled: {opacity: 0.45},
  inline: {alignSelf: 'flex-start'},
  input: {color: '#242424', flex: 1, minWidth: 0, padding: 0},
  large: {minHeight: 40},
  medium: {minHeight: 32},
  root: {alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#8a8886', borderRadius: 4, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 10, width: '100%'},
  small: {minHeight: 24},
  underline: {borderLeftWidth: 0, borderRadius: 0, borderRightWidth: 0, borderTopWidth: 0},
});
