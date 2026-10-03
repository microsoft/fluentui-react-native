/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { findNodeHandle, StyleSheet } from 'react-native';

import { directComponent, mergeProps, phasedComponent, useSlot } from '@fluentui-react-native/framework-base';

import type { CalloutProps } from '../legacy/callout/Callout.types';
import { calloutName } from '../legacy/callout/Callout.types';
import NativeCalloutView, { Commands } from '../specs/components/CalloutNativeComponent';
import type { NativeProps } from '../specs/components/CalloutNativeComponent';

export interface CalloutHostProps extends CalloutProps {
  ref?: React.Ref<React.ComponentRef<typeof NativeCalloutView>>;
  nativeRef?: React.Ref<React.ComponentRef<typeof NativeCalloutView>>;
  nativeTarget?: number;
  commandGeneration?: number;
  anchorMode?: NativeProps['anchorMode'];
  onReady?: NativeProps['onReady'];
  onClosed?: NativeProps['onClosed'];
  onOperationResult?: NativeProps['onOperationResult'];
}

const colorTransparent = '#00000000';

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
  },
});

/**
 * Renders the native Callout without applying theme or appearance defaults.
 */
export const CalloutHost = phasedComponent<CalloutHostProps>((props) => {
  const { componentRef, target } = props;
  const nativeComponentRef = React.useRef<React.ElementRef<typeof NativeCalloutView> | null>(null);
  const [nativeTarget, setNativeTarget] = React.useState<number | string | undefined>(undefined);
  const BaseRoot = useSlot(NativeCalloutView, { ref: nativeComponentRef });
  const Root = useSlot(BaseRoot, props.nativeRef ? { ref: props.nativeRef } : {});

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

  return directComponent<CalloutHostProps>((renderProps) => {
    const {
      anchorRect,
      backgroundColor,
      beakWidth,
      borderColor,
      borderRadius,
      borderWidth,
      componentRef: _componentRef,
      directionalHint,
      dismissBehaviors,
      gapSpace,
      maxHeight,
      maxWidth,
      minPadding,
      minWidth,
      style,
      target: _target,
      nativeTarget: resolvedTarget,
      nativeRef: _nativeRef,
      ref,
      ...nativeProps
    } = mergeProps(props, renderProps);

    /**
     * Build the style for the callout based on the props. For `borderColor`, `borderWidth`, `backgroundColor`, and
     * `borderRadius` defaults values are required otherwise crashes in CalloutView.swift:updateLayer() will occur.
     */
    const calloutStyle = {
      backgroundColor: backgroundColor ?? colorTransparent,
      borderColor: borderColor ?? colorTransparent,
      borderWidth: borderWidth ?? 0,
      borderRadius: borderRadius ?? 0,
      ...(maxHeight != null && { maxHeight }),
      ...(maxWidth != null && { maxWidth }),
      ...(minWidth != null && { minWidth }),
    };

    const nativeStyle = [styles.root, calloutStyle, style];
    const element = (
      <Root
        {...nativeProps}
        {...(ref ? { ref } : {})}
        anchorRect={anchorRect}
        beakWidth={beakWidth}
        directionalHint={directionalHint}
        dismissBehaviors={dismissBehaviors}
        gapSpace={gapSpace}
        maxHeight={typeof maxHeight === 'number' ? maxHeight : undefined}
        maxWidth={typeof maxWidth === 'number' ? maxWidth : undefined}
        minPadding={minPadding}
        minWidth={typeof minWidth === 'number' ? minWidth : undefined}
        style={nativeStyle}
        {...(resolvedTarget !== undefined || nativeTarget !== undefined ? { target: resolvedTarget ?? nativeTarget } : {})}
      />
    );
    // Slot ref composition must not change the legacy style-array shape.
    return React.cloneElement(element, { style: nativeStyle });
  });
});

CalloutHost.displayName = calloutName;

export default CalloutHost;
