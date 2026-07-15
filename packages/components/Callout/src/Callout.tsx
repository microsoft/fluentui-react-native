/** @jsxImportSource @fluentui-react-native/framework-base */

import * as React from 'react';
import { findNodeHandle } from 'react-native';
import type { ViewStyle } from 'react-native';

import { directComponent, mergeProps, mergeStyles, phasedComponent } from '@fluentui-react-native/framework-base';

import { defaultCalloutTokens, defaultRootStyle } from './Callout.settings';
import type { ICalloutProps } from './Callout.types';
import { calloutName } from './Callout.types';
import NativeCalloutView, { Commands } from './CalloutNativeComponent';
import type { NativeProps } from './CalloutNativeComponent';

/**
 * Splits the merged Callout props into the shape expected by the native component:
 * - style-related tokens (`backgroundColor`, `borderColor`, `borderRadius`, `borderWidth`) are
 *   folded into the root `style`.
 * - tokens with no representation in the native component contract (`beakWidth`, `gapSpace`,
 *   `minPadding`, `minWidth`) are dropped.
 * - `componentRef`, `target` and `children` are handled by the enclosing component and removed here.
 * - everything else (`directionalHint`, `anchorRect`, `dismissBehaviors`, event handlers, generic
 *   view props, etc.) is passed straight through to the native view.
 */
function toNativeProps(props: ICalloutProps): NativeProps {
  const {
    // fold color/border tokens into the root style
    backgroundColor,
    borderColor,
    borderRadius,
    borderWidth,
    // win32-only tokens with no representation in the native component contract
    beakWidth: _beakWidth,
    gapSpace: _gapSpace,
    minPadding: _minPadding,
    minWidth: _minWidth,
    // handled by the enclosing component
    componentRef: _componentRef,
    target: _target,
    style,
    ...rest
  } = props;

  const tokenStyle: ViewStyle = {};
  if (backgroundColor !== undefined) {
    tokenStyle.backgroundColor = backgroundColor;
  }
  if (borderColor !== undefined) {
    tokenStyle.borderColor = borderColor;
  }
  if (borderRadius !== undefined) {
    tokenStyle.borderRadius = borderRadius;
  }
  if (borderWidth !== undefined) {
    tokenStyle.borderWidth = borderWidth;
  }

  return {
    ...rest,
    style: mergeStyles(defaultRootStyle, tokenStyle, style),
  } as NativeProps;
}

export const Callout = phasedComponent((props: ICalloutProps) => {
  const nativeComponentRef = React.useRef<React.ElementRef<typeof NativeCalloutView> | null>(null);
  const { componentRef, target } = props;

  React.useImperativeHandle(
    componentRef,
    () => ({
      blurWindow() {
        if (nativeComponentRef.current != null) {
          Commands.blurWindow(nativeComponentRef.current);
        }
      },
      focusWindow() {
        if (nativeComponentRef.current != null) {
          Commands.focusWindow(nativeComponentRef.current);
        }
      },
    }),
    [],
  );

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

  return directComponent<ICalloutProps>((innerProps: ICalloutProps) => {
    // Merge in the default token/prop values, the props captured in the first phase, and any props
    // supplied when rendered directly or as a slot (children arrive via `innerProps`).
    const { children, ...merged } = mergeProps(defaultCalloutTokens, props, innerProps) as React.PropsWithChildren<ICalloutProps>;
    const nativeProps = toNativeProps(merged);

    return (
      <NativeCalloutView {...nativeProps} {...(nativeTarget != null ? { target: nativeTarget } : null)} ref={nativeComponentRef}>
        {children}
      </NativeCalloutView>
    );
  });
});

Callout.displayName = calloutName;

export default Callout;
