/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { findNodeHandle, StyleSheet } from 'react-native';

import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import type { CalloutProps } from './Callout.types';
import { calloutName } from './Callout.types';
import NativeCalloutView, { Commands } from './CalloutNativeComponent';

const colorTransparent = '#00000000';

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
  },
});

/**
 * Renders the native Callout without applying theme or appearance defaults.
 */
export const Callout = phasedComponent<CalloutProps>((props) => {
  const { componentRef, target } = props;
  const nativeComponentRef = React.useRef<React.ElementRef<typeof NativeCalloutView> | null>(null);
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

    return (
      <NativeCalloutView
        {...nativeProps}
        anchorRect={anchorRect}
        beakWidth={beakWidth}
        directionalHint={directionalHint}
        dismissBehaviors={dismissBehaviors}
        gapSpace={gapSpace}
        maxHeight={typeof maxHeight === 'number' ? maxHeight : undefined}
        maxWidth={typeof maxWidth === 'number' ? maxWidth : undefined}
        minPadding={minPadding}
        minWidth={typeof minWidth === 'number' ? minWidth : undefined}
        ref={nativeComponentRef}
        style={[styles.root, calloutStyle, style]}
        {...(nativeTarget !== undefined && { target: nativeTarget })}
      />
    );
  });
});

Callout.displayName = calloutName;

export default Callout;
