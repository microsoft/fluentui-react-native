import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

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

export default codegenNativeComponent<NativeProps>('FRNPopUpButton') as HostComponent<NativeProps>;
