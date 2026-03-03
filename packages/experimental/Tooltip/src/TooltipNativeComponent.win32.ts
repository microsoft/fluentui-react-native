import type { HostComponent, ViewProps } from 'react-native';

import { requireNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  content?: string;
}

export default requireNativeComponent<NativeProps>('RCTTooltip') as HostComponent<NativeProps>;
