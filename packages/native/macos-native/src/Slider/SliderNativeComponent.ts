import type { ViewProps } from 'react-native';
import type { BubblingEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  value?: number;
  defaultValue?: number;
  minimumValue?: number;
  maximumValue?: number;
  numberOfTickMarks?: number;
  continuous?: WithDefault<boolean, true>;
  disabled?: boolean;
  tooltip?: string;
  onValueChange?: BubblingEventHandler<{ value: number }>;
}

export default requireNativeComponent<NativeProps>('FRNSlider');
