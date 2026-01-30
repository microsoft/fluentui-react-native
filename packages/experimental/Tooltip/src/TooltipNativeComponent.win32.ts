import type { HostComponent } from 'react-native';
import type { NativeProps } from './Tooltip.types';

import { requireNativeComponent } from 'react-native';

export default requireNativeComponent<NativeProps>('RCTTooltip') as HostComponent<NativeProps>;
