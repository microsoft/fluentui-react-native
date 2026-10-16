import type * as React from 'react';
import type { ViewProps } from 'react-native';
import type NativeFocusZone from '../../specs/components/FocusZoneNativeComponent';
import type { NativeViewTarget } from '../nativeTarget';
import type { NativeOperationOptions, NativeOperationOutcome } from '../nativeOperation';

export type FocusZoneHandle = React.ComponentRef<typeof NativeFocusZone>;

export interface FocusZoneCommands {
  requestFocus(target?: 'default' | 'first' | 'last' | NativeViewTarget, options?: NativeOperationOptions): Promise<NativeOperationOutcome>;
}

export interface FocusZoneProps extends ViewProps {
  ref?: React.Ref<FocusZoneHandle>;
  commandsRef?: React.Ref<FocusZoneCommands>;
  disabled?: boolean;
  direction?: 'none' | 'horizontal' | 'vertical' | 'both';
  navigation?: 'platform' | 'spatial';
  arrowBoundary?: 'stop' | 'wrap';
  tabNavigation?: 'exit' | 'native' | 'cycle' | 'stop';
  defaultTarget?: NativeViewTarget;
}
