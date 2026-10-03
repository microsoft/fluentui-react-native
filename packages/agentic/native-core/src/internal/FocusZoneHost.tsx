/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { directComponent, mergeProps, phasedComponent, useSlot } from '@fluentui-react-native/framework-base';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { FocusZoneProps } from '../legacy/focus-zone/FocusZone.types';
import { focusZoneName } from '../legacy/focus-zone/FocusZone.types';
import NativeFocusZone from '../specs/components/FocusZoneNativeComponent';
import type { NativeSyntheticEvent } from 'react-native';
import type { NativeOperationResult } from '../components/nativeOperation';

export interface FocusZoneHostProps extends FocusZoneProps {
  navigateAtEnd?: 'NavigateStopAtEnds' | 'NavigateWrap' | 'NavigateContinue';
  ref?: React.Ref<React.ComponentRef<typeof NativeFocusZone>>;
  nativeRef?: React.Ref<React.ComponentRef<typeof NativeFocusZone>>;
  nativeDefaultTarget?: number;
  commandGeneration?: number;
  onOperationResult?: (event: NativeSyntheticEvent<NativeOperationResult>) => void;
}

/**
 * Renders the native FocusZone without applying theme or appearance defaults.
 */
export const FocusZoneHost = phasedComponent<FocusZoneHostProps>((props) => {
  const { componentRef, defaultTabbableElement } = props;
  const nativeRef = useViewCommandFocus(componentRef);
  const BaseRoot = useSlot(NativeFocusZone, { ref: nativeRef });
  const Root = useSlot(BaseRoot, props.nativeRef ? { ref: props.nativeRef } : {});
  const [nativeDefaultTabbableElement, setNativeDefaultTabbableElement] = React.useState<number | string>();

  React.useLayoutEffect(() => {
    if (typeof defaultTabbableElement === 'string') {
      setNativeDefaultTabbableElement(defaultTabbableElement);
    } else if (defaultTabbableElement?.current) {
      setNativeDefaultTabbableElement(findNodeHandle(defaultTabbableElement.current) ?? undefined);
    } else {
      setNativeDefaultTabbableElement(undefined);
    }
  }, [defaultTabbableElement]);

  return directComponent<FocusZoneHostProps>((renderProps) => {
    const {
      componentRef: _componentRef,
      defaultTabbableElement: _defaultTabbableElement,
      nativeDefaultTarget,
      nativeRef: _nativeRef,
      ref,
      isCircularNavigation,
      navigateAtEnd = isCircularNavigation ? 'NavigateWrap' : 'NavigateStopAtEnds',
      ...nativeProps
    } = mergeProps(props, renderProps) as FocusZoneHostProps & {
      navigateAtEnd?: 'NavigateStopAtEnds' | 'NavigateWrap' | 'NavigateContinue';
    };

    return (
      <Root
        {...nativeProps}
        {...(ref ? { ref } : {})}
        defaultTabbableElement={nativeDefaultTarget ?? nativeDefaultTabbableElement}
        navigateAtEnd={navigateAtEnd}
      />
    );
  });
});

FocusZoneHost.displayName = focusZoneName;
