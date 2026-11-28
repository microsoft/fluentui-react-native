import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import NativeRangeTarget from '../../specs/components/RangeTargetNativeComponent';

export type RangeTargetProps = ComponentProps<typeof NativeRangeTarget>;

export function RangeTarget(props: RangeTargetProps) {
  if (Platform.OS !== 'macos') throw new Error('RangeTarget requires the AppKit FRNNativeCore native view.');
  return <NativeRangeTarget {...props} />;
}
