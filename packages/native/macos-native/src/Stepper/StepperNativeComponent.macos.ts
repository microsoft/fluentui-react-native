import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  value?: number;
  defaultValue?: number;
  minimumValue?: number;
  maximumValue?: number;
  increment?: number;
  autorepeat?: boolean;
  wraps?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onValueChange?: BubblingEventHandler<{ value: number }>;
}

export default codegenNativeComponent<NativeProps>('FRNStepper') as HostComponent<NativeProps>;
