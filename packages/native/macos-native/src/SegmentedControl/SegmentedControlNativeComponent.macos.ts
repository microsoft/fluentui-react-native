import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeSegmentDescriptor {
  label?: string;
  enabled?: boolean;
  width?: number;
}

export interface NativeProps extends ViewProps {
  segments?: NativeSegmentDescriptor[];
  selectedIndex?: number;
  trackingMode?: WithDefault<'selectOne' | 'selectAny' | 'momentary', 'selectOne'>;
  segmentStyle?: WithDefault<
    'automatic' | 'rounded' | 'texturedRounded' | 'roundRect' | 'texturedSquare' | 'capsule' | 'smallSquare' | 'separated',
    'automatic'
  >;
  disabled?: boolean;
  tooltip?: string;
  onChange?: BubblingEventHandler<{ selectedIndex: number }>;
}

export default codegenNativeComponent<NativeProps>('FRNSegmentedControl') as HostComponent<NativeProps>;
