import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  label: string;
  expanded?: boolean;
  defaultExpanded?: WithDefault<boolean, false>;
  disabled?: boolean;
  onExpandedChange?: BubblingEventHandler<{ expanded: boolean }>;
}

export default codegenNativeComponent<NativeProps>('FRNDisclosureGroup') as HostComponent<NativeProps>;
