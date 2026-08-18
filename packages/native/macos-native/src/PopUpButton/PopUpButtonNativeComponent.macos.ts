import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, Int32, UnsafeMixed } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  // An array of `{ title: string; identifier?: string; enabled?: boolean }` item descriptors. Codegen
  // does not support arrays of custom object shapes, so this is passed through as UnsafeMixed and
  // parsed natively (see FRNPopUpButtonManager.m / FRNPopUpButton.swift).
  items?: UnsafeMixed;
  selectedIndex?: Int32;
  pullsDown?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onChange?: BubblingEventHandler<{ selectedIndex: Int32; identifier: string }>;
}

export default codegenNativeComponent<NativeProps>('FRNPopUpButton') as HostComponent<NativeProps>;
