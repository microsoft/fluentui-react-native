import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, Double } from 'react-native/Libraries/Types/CodegenTypes';
import { codegenNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  value?: Double;
  defaultValue?: Double;
  minimumValue?: Double;
  maximumValue?: Double;
  increment?: Double;
  autorepeat?: boolean;
  wraps?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onValueChange?: BubblingEventHandler<{ value: Double }>;
}

export default codegenNativeComponent<NativeProps>('FRNStepper') as HostComponent<NativeProps>;
