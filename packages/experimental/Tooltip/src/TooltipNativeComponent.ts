/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent } from 'react-native';
import type { NativeProps } from './Tooltip.types';

import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export default codegenNativeComponent<NativeProps>('RCTTooltip') as HostComponent<NativeProps>;
