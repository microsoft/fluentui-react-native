/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { ViewProps } from 'react-native';

import type { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import { requireNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenTypes';
// Should be:
// import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  navigateAtEnd?: WithDefault<'NavigateStopAtEnds' | 'NavigateWrap' | 'NavigateContinue', 'NavigateStopAtEnds'>;
  defaultTabbableElement?: UnsafeMixed;
  focusZoneDirection?: WithDefault<'bidirectional' | 'vertical' | 'horizontal' | 'none', 'bidirectional'>;
  use2DNavigation?: boolean;
  tabKeyNavigation?: WithDefault<'None' | 'NavigateWrap' | 'NavigateStopAtEnds' | 'Normal', 'None'>;
  disabled?: boolean;
  isTabNavigation?: boolean;
}

export default requireNativeComponent<NativeProps>('RCTFocusZone');
