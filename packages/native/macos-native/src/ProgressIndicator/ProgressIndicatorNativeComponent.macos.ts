import type { HostComponent, ViewProps } from 'react-native';
import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  indicatorStyle?: WithDefault<'bar' | 'spinner', 'bar'>;
  indeterminate?: WithDefault<boolean, true>;
  value?: number;
  minValue?: number;
  maxValue?: number;
  animating?: boolean;
}

export default codegenNativeComponent<NativeProps>('FRNProgressIndicator') as HostComponent<NativeProps>;
