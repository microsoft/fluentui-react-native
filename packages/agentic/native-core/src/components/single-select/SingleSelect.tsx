import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import NativeSingleSelect from '../../specs/components/SingleSelectNativeComponent';

export type SingleSelectProps = ComponentProps<typeof NativeSingleSelect>;

export function SingleSelect(props: SingleSelectProps) {
  if (Platform.OS !== 'macos') throw new Error('SingleSelect requires the AppKit FRNNativeCore native view.');
  return <NativeSingleSelect {...props} />;
}
