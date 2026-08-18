import type { ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  title?: string;
  bezelStyle?: string;
  disabled?: boolean;
  tooltip?: string;
  onPress?: BubblingEventHandler<null>;
}

export default requireNativeComponent<NativeProps>('FRNButton');
