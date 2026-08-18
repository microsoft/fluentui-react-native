import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

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

export default codegenNativeComponent<NativeProps>('FRNSlider') as HostComponent<NativeProps>;
