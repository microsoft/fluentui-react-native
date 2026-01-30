/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import { requireNativeComponent, type HostComponent, type ViewProps } from 'react-native';

import type { Double } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  delay?: Double;
  duration?: Double;
  nativeAnimationClass?: string;
}

export default requireNativeComponent<NativeProps>('RCTNativeAnimatedContainer') as HostComponent<NativeProps>;
