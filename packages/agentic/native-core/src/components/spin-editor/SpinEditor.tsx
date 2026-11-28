import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import NativeSpinEditor from '../../specs/components/SpinEditorNativeComponent';

export type SpinEditorProps = ComponentProps<typeof NativeSpinEditor>;

export function SpinEditor(props: SpinEditorProps) {
  if (Platform.OS !== 'macos') throw new Error('SpinEditor requires the AppKit FRNNativeCore native view.');
  return <NativeSpinEditor {...props} />;
}
