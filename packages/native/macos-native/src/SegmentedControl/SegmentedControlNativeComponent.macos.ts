import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, Int32, UnsafeMixed, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  // An array of `{ label?: string; enabled?: boolean; width?: number }` segment descriptors. Codegen
  // does not support arrays of custom object shapes, so this is passed through as UnsafeMixed and
  // parsed natively (see FRNSegmentedControlManager.m / FRNSegmentedControl.swift).
  segments?: UnsafeMixed;
  selectedIndex?: Int32;
  trackingMode?: WithDefault<'selectOne' | 'selectAny' | 'momentary', 'selectOne'>;
  segmentStyle?: WithDefault<
    'automatic' | 'rounded' | 'texturedRounded' | 'roundRect' | 'texturedSquare' | 'capsule' | 'smallSquare' | 'separated',
    'automatic'
  >;
  disabled?: boolean;
  tooltip?: string;
  onChange?: BubblingEventHandler<{ selectedIndex: Int32 }>;
}

export default codegenNativeComponent<NativeProps>('FRNSegmentedControl') as HostComponent<NativeProps>;
