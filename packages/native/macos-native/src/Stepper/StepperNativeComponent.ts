import type { ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

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

export default requireNativeComponent<NativeProps>('FRNStepper');
