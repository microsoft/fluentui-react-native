/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import { CalloutHost } from '../../internal/CalloutHost';
import type { CalloutProps } from './Callout.types';
import { calloutName } from './Callout.types';
import type NativeCalloutView from '../../specs/components/CalloutNativeComponent';
import { Commands } from '../../specs/components/CalloutNativeComponent';

/**
 * Renders the native Callout without applying theme or appearance defaults.
 */
export const Callout = phasedComponent<CalloutProps>((props) => {
  const { componentRef, target } = props;
  const nativeComponentRef = React.useRef<React.ComponentRef<typeof NativeCalloutView> | null>(null);
  const [nativeTarget, setNativeTarget] = React.useState<number | string | undefined>(undefined);

  React.useImperativeHandle(
    componentRef,
    () => ({
      blurWindow() {
        if (nativeComponentRef.current !== null) {
          Commands.blurWindow(nativeComponentRef.current);
        }
      },
      focusWindow() {
        if (nativeComponentRef.current !== null) {
          Commands.focusWindow(nativeComponentRef.current);
        }
      },
    }),
    [],
  );

  React.useLayoutEffect(() => {
    if (typeof target === 'string') {
      setNativeTarget(target);
    } else if (target?.current) {
      setNativeTarget(findNodeHandle(target.current) ?? undefined);
    } else {
      setNativeTarget(undefined);
    }
  }, [target]);

  return directComponent<CalloutProps>((renderProps) => {
    const { componentRef: _componentRef, target: _target, ...hostProps } = mergeProps(props, renderProps);

    return <CalloutHost {...hostProps} ref={nativeComponentRef} {...(nativeTarget !== undefined && { target: nativeTarget })} />;
  });
});

Callout.displayName = calloutName;

export default Callout;
