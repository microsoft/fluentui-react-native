/** @jsxImportSource @fluentui-react-native/framework-base */
/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import * as React from 'react';
import { findNodeHandle, Platform } from 'react-native';

import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import type { DirectionalHint, ICalloutProps } from './Callout.types';
import { calloutName } from './Callout.types';

import NativeCalloutView from './CalloutNativeComponent';
import { Commands } from './CalloutNativeComponent';

const defaultDirectionalHint: DirectionalHint = Platform.OS === 'macos' ? 'topLeftEdge' : 'bottonLeftEdge';

export const Callout = phasedComponent<ICalloutProps>((props) => {
  const { componentRef, target } = props;
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

  return directComponent<ICalloutProps>((finalProps) => {
    const {
      children,
      componentRef: _componentRef,
      directionalHint = defaultDirectionalHint,
      target: _target,
      ...rest
    } = mergeProps(props, finalProps);

    return (
      <NativeCalloutView
        ref={nativeComponentRef}
        {...(nativeTarget !== null && { target: nativeTarget })}
        directionalHint={directionalHint}
        {...rest}
      >
        {children}
      </NativeCalloutView>
    );
  });
});

Callout.displayName = calloutName;

export default Callout;
