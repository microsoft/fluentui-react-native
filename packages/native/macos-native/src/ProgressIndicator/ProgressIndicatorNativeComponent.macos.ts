import type { HostComponent, ViewProps } from 'react-native';
import type { Double, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import { codegenNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  indicatorStyle?: WithDefault<'bar' | 'spinner', 'bar'>;
  indeterminate?: WithDefault<boolean, true>;
  value?: Double;
  minValue?: Double;
  maxValue?: Double;
  animating?: boolean;
}

export default codegenNativeComponent<NativeProps>('FRNProgressIndicator') as HostComponent<NativeProps>;
