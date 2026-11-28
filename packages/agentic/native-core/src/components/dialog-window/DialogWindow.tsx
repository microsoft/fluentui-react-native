import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import NativeDialogWindow from '../../specs/components/DialogWindowNativeComponent';

export type DialogWindowProps = ComponentProps<typeof NativeDialogWindow>;

export function DialogWindow(props: DialogWindowProps) {
  if (Platform.OS !== 'macos') throw new Error('DialogWindow requires the AppKit FRNNativeCore native view.');
  return <NativeDialogWindow {...props} />;
}
