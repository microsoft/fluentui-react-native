import { requireNativeComponent } from 'react-native';
import type { ViewProps } from 'react-native';
import type { BubblingEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  label: string;
  expanded?: boolean;
  defaultExpanded?: WithDefault<boolean, false>;
  disabled?: boolean;
  onExpandedChange?: BubblingEventHandler<{ expanded: boolean }>;
}

export default requireNativeComponent<NativeProps>('FRNDisclosureGroup');
