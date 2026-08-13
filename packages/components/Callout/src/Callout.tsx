/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { findNodeHandle, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import type { CalloutProps, CalloutTokens } from './Callout.types';
import { calloutName } from './Callout.types';
import NativeCalloutView, { Commands } from './CalloutNativeComponent';

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
  },
});

function getCalloutStyle({
  backgroundColor,
  borderColor,
  borderRadius,
  borderWidth,
  maxHeight,
  maxWidth,
  minWidth,
}: CalloutTokens): ViewStyle | undefined {
  const hasStyle =
    backgroundColor !== undefined ||
    borderColor !== undefined ||
    borderRadius !== undefined ||
    borderWidth !== undefined ||
    maxHeight !== undefined ||
    maxWidth !== undefined ||
    minWidth !== undefined;

  if (!hasStyle) {
    return undefined;
  }

  return {
    backgroundColor,
    borderColor,
    borderRadius,
    borderWidth,
    maxHeight,
    maxWidth,
    minWidth,
  };
}

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
    const calloutStyle = getCalloutStyle({
      anchorRect,
      backgroundColor,
      beakWidth,
      borderColor,
      borderRadius,
      borderWidth,
      directionalHint,
      dismissBehaviors,
      gapSpace,
      maxHeight,
      maxWidth,
      minPadding,
      minWidth,
    });

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
