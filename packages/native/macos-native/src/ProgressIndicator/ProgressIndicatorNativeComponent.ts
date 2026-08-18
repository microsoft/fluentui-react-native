import type { ViewProps } from 'react-native';
import { requireNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  indicatorStyle?: 'bar' | 'spinner';
  indeterminate?: boolean;
  value?: number;
  minValue?: number;
  maxValue?: number;
  animating?: boolean;
}

export default requireNativeComponent<NativeProps>('FRNProgressIndicator');
