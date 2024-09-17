/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import * as React from 'react';
import { findNodeHandle, Platform } from 'react-native';
import type { HostComponent } from 'react-native';

import { setAndForwardRef } from '@fluentui-react-native/interactive-hooks';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings } from './Callout.settings';
import type { CalloutNativeMethods, ICalloutProps, ICalloutSlotProps, ICalloutType } from './Callout.types';
import { calloutName } from './Callout.types';
import type { NativeProps as CalloutNativeProps } from './CalloutNativeComponent';
import CalloutNativeComponent from './CalloutNativeComponent';
import type { NativeProps as MacOSCalloutNativeProps } from './MacOSCalloutNativeComponent';
import MacOSCalloutNativeComponent from './MacOSCalloutNativeComponent';

const NativeCalloutView = Platform.select<HostComponent<MacOSCalloutNativeProps> | HostComponent<CalloutNativeProps>>({
  macos: MacOSCalloutNativeComponent,
  default: CalloutNativeComponent, // win32
});

export function useWindowCommandFocus(
  forwardedRef: React.Ref<CalloutNativeMethods | null> | undefined,
  // initialValue?: React.Component
): (ref: React.ElementRef<any>) => void {
  /**
   * Set up the forwarding ref to enable adding the focus method.
   */
  const focusRef = React.useRef<any>();

  const _setNativeRef = setAndForwardRef({
    getForwardedRef: () => forwardedRef,
    setLocalRef: (localRef: any) => {
      focusRef.current = localRef;
    },
  });
  return _setNativeRef;
}

export const Callout = compose<ICalloutType>({
  displayName: calloutName,
  usePrepareProps: (props: ICalloutProps, useStyling: IUseComposeStyling<ICalloutType>) => {
    const { componentRef, target, ...rest } = props;
    const calloutRef = useWindowCommandFocus(componentRef);
    const [nativeTarget, setNativeTarget] = React.useState<number | string | null>(null);

    React.useLayoutEffect(() => {
      if (typeof target === 'string') {
        // Pass string type `target` directly
        setNativeTarget(target);
      } else if (target?.current) {
        // Pass the tagID for a valid ref `target`
        setNativeTarget(findNodeHandle(target.current));
      } else {
        // Clear `target` so we may fall back on `anchorRect` if provided
        setNativeTarget(null);
      }
    }, [target]);

    const slotProps = mergeSettings<ICalloutSlotProps>(useStyling(props), {
      root: {
        ref: calloutRef,
        ...(nativeTarget && { target: nativeTarget }),
        ...rest,
      },
    });

    return { slotProps };
  },
  settings: settings,
  slots: {
    root: NativeCalloutView,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
  },
});

export default Callout;
