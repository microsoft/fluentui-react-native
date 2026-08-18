import type { ViewProps } from 'react-native';
import type { WithDefault, BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  value?: boolean;
  defaultValue?: WithDefault<boolean, false>;
  disabled?: boolean;
  tooltip?: string;
  onValueChange?: BubblingEventHandler<{ value: boolean }>;
}

export default requireNativeComponent<NativeProps>('FRNSwitch');
