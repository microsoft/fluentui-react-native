/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import * as React from 'react';
import { findNodeHandle, Platform } from 'react-native';
import type { HostComponent } from 'react-native';

import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings } from './Callout.settings';
import type { ICalloutProps, ICalloutSlotProps, ICalloutType } from './Callout.types';
import { calloutName } from './Callout.types';
import type { NativeProps as CalloutNativeProps } from './CalloutNativeComponent';
import CalloutNativeComponent from './CalloutNativeComponent';
import type { NativeProps as FRNCalloutNativeProps } from './MacOSCalloutNativeComponent';
import FRNCalloutNativeComponent from './MacOSCalloutNativeComponent';
import { Commands } from './MacOSCalloutNativeComponent';

const NativeCalloutView = Platform.select<HostComponent<FRNCalloutNativeProps> | HostComponent<CalloutNativeProps>>({
  macos: FRNCalloutNativeComponent,
  default: CalloutNativeComponent, // win32
});

export const Callout = compose<ICalloutType>({
  displayName: calloutName,
  usePrepareProps: (props: ICalloutProps, useStyling: IUseComposeStyling<ICalloutType>) => {
    const { componentRef, target, ...rest } = props;
    React.useImperativeHandle(
      componentRef,
      () => ({
        blurWindow() {
          if (componentRef.current != null) {
            Commands.blurWindow(nativeComponentRef.current);
          }
        },
        focusWindow() {
          if (componentRef.current != null) {
            Commands.focusWindow(nativeComponentRef.current);
          }
        },
      }),
      [componentRef],
    );
    const nativeComponentRef = React.useRef<React.ElementRef<typeof NativeCalloutView> | null>(null);
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
        ref: nativeComponentRef,
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
