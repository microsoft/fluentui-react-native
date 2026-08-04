/** @jsxImportSource @fluentui-react-native/framework-base */
/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { phasedComponent, useSlot } from '@fluentui-react-native/framework-base';

import type { ICalloutProps } from './Callout.types';
import { calloutName } from './Callout.types';

import NativeCalloutView from './CalloutNativeComponent';
import { Commands } from './CalloutNativeComponent';

export const Callout = phasedComponent<ICalloutProps>((props) => {
  const { componentRef, target, ...rest } = props;
  const nativeComponentRef = React.useRef<React.ElementRef<typeof NativeCalloutView> | null>(null);
  const [nativeTarget, setNativeTarget] = React.useState<number | string | null>(null);

  React.useImperativeHandle(componentRef, () => ({
    blurWindow() {
      if (nativeComponentRef.current) {
        Commands.blurWindow(nativeComponentRef.current);
      }
    },
    focusWindow() {
      if (nativeComponentRef.current) {
        Commands.focusWindow(nativeComponentRef.current);
      }
    },
  }));

  React.useLayoutEffect(() => {
    if (typeof target === 'string') {
      setNativeTarget(target);
    } else if (target?.current) {
      setNativeTarget(findNodeHandle(target.current));
    } else {
      setNativeTarget(null);
    }
  }, [target]);

  return useSlot(NativeCalloutView, {
    ref: nativeComponentRef,
    ...(nativeTarget !== null && { target: nativeTarget }),
    ...rest,
  });
});

Callout.displayName = calloutName;

export default Callout;
