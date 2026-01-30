/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { ViewProps } from 'react-native';

import type { Double } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  delay?: Double;
  duration?: Double;
}

export default requireNativeComponent<NativeProps>('RCTNativeAnimatedShimmer');
