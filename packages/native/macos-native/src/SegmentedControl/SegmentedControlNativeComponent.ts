import type { ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

export interface NativeSegmentDescriptor {
  label?: string;
  enabled?: boolean;
  width?: number;
}

export interface NativeProps extends ViewProps {
  segments?: NativeSegmentDescriptor[];
  selectedIndex?: number;
  trackingMode?: string;
  segmentStyle?: string;
  disabled?: boolean;
  tooltip?: string;
  onChange?: BubblingEventHandler<{ selectedIndex: number }>;
}

export default requireNativeComponent<NativeProps>('FRNSegmentedControl');
