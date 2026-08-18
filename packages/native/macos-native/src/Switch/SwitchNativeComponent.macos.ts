import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  value?: boolean;
  defaultValue?: WithDefault<boolean, false>;
  disabled?: boolean;
  tooltip?: string;
  onValueChange?: BubblingEventHandler<{ value: boolean }>;
}

export default codegenNativeComponent<NativeProps>('FRNSwitch') as HostComponent<NativeProps>;
