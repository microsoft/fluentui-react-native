import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, Double, Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  value?: Double;
  defaultValue?: Double;
  minimumValue?: Double;
  maximumValue?: Double;
  numberOfTickMarks?: Int32;
  continuous?: WithDefault<boolean, true>;
  disabled?: boolean;
  tooltip?: string;
  onValueChange?: BubblingEventHandler<{ value: Double }>;
}

export default codegenNativeComponent<NativeProps>('FRNSlider') as HostComponent<NativeProps>;
