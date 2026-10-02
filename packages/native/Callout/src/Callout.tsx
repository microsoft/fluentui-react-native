/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { findNodeHandle, Platform, StyleSheet } from 'react-native';

import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import type { CalloutProps } from './Callout.types';
import { calloutName } from './Callout.types';
import NativeCalloutView, { Commands } from './CalloutNativeComponent';
import type { NativeProps } from './CalloutNativeComponent';
import { createMenuFocusManagement, isDismissContextEvent, isMenuPointerMoveEvent } from './menuFocusManagement';

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
  const { componentRef, target, menuFocusManagement } = props;
  const nativeComponentRef = React.useRef<React.ElementRef<typeof NativeCalloutView> | null>(null);
  const [nativeTarget, setNativeTarget] = React.useState<number | string | undefined>(undefined);
  const managed = menuFocusManagement === true && (Platform.OS === 'macos' || Platform.OS === 'windows');
  if (managed && (target === undefined || typeof target === 'string')) {
    throw new Error('Callout menuFocusManagement requires a native ref anchor.');
  }
  const [focusManagement] = React.useState(() =>
    createMenuFocusManagement(
      (generation, requestId, instance) => {
        const view = nativeComponentRef.current;
        const targetTag = findNodeHandle(instance);
        if (!view || targetTag == null) return false;
        Commands.focusInitialChild(view, generation, requestId, targetTag);
        return true;
      },
      (generation, requestId, reason, returnFocus) => {
        const view = nativeComponentRef.current;
        if (!view) return false;
        Commands.closeOwned(view, generation, requestId, reason, returnFocus);
        return true;
      },
      Platform.OS === 'macos'
        ? (generation, requestId, instance, intent) => {
            const view = nativeComponentRef.current;
            const targetTag = findNodeHandle(instance);
            if (!view || targetTag == null) return false;
            Commands.focusOwnedChild(view, generation, requestId, targetTag, intent);
            return true;
          }
        : undefined,
    ),
  );
  const setNativeRef = React.useCallback(
    (instance: React.ElementRef<typeof NativeCalloutView> | null) => {
      if (nativeComponentRef.current !== instance) focusManagement.detach();
      nativeComponentRef.current = instance;
    },
    [focusManagement],
  );

  React.useLayoutEffect(() => {
    focusManagement.setEnabled(managed);
    return () => focusManagement.setEnabled(false);
  }, [focusManagement, managed]);

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
      focusInitialChild: focusManagement.focusInitialChild,
      focusOwnedChild: focusManagement.focusOwnedChild,
      closeOwned: focusManagement.closeOwned,
    }),
    [focusManagement],
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
      menuFocusManagement: _menuFocusManagement,
      onReady,
      onDismissContext,
      onMenuPointerMove,
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
    const handleReady: NonNullable<NativeProps['onReady']> = (event) => {
      focusManagement.onReady(event.nativeEvent.generation);
      onReady?.(event);
    };
    const handleDismissContext: NonNullable<NativeProps['onDismissContext']> = (event) => {
      if (!isDismissContextEvent(event)) throw new Error('Callout received invalid managed dismissal context.');
      focusManagement.onDismiss(event.nativeEvent.generation);
      onDismissContext?.(event);
    };
    const handleOperationResult: NonNullable<NativeProps['onManagedOperationResult']> = (event) => {
      focusManagement.onResult(event.nativeEvent);
    };
    const handlePointerMove: NonNullable<NativeProps['onMenuPointerMove']> = (event) => {
      if (!isMenuPointerMoveEvent(event)) throw new Error('Callout received invalid managed pointer movement.');
      if (focusManagement.isCurrentGeneration(event.nativeEvent.generation)) onMenuPointerMove?.(event);
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
        ref={setNativeRef}
        style={[styles.root, calloutStyle, style]}
        {...(nativeTarget !== undefined && { target: nativeTarget })}
        {...(managed && {
          menuFocusManagement: true,
          onReady: handleReady,
          onDismissContext: handleDismissContext,
          onManagedOperationResult: handleOperationResult,
        })}
        {...(managed && Platform.OS === 'macos' && { onMenuPointerMove: handlePointerMove })}
      />
    );
  });
});

Callout.displayName = calloutName;

export default Callout;
