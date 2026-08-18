import type { ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

export interface NativePopUpItem {
  title: string;
  identifier?: string;
  enabled?: boolean;
}

export interface NativeProps extends ViewProps {
  items?: NativePopUpItem[];
  selectedIndex?: number;
  pullsDown?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onChange?: BubblingEventHandler<{ selectedIndex: number; identifier: string | null }>;
}

export default requireNativeComponent<NativeProps>('FRNPopUpButton');
