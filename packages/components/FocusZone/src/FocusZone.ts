/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { phasedComponent, useSlot } from '@fluentui-react-native/framework-base';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { FocusZoneProps, NativeProps } from './FocusZone.types';
import { focusZoneName } from './FocusZone.types';
import RCTFocusZone from './FocusZoneNativeComponent';

const filterOutComponentRef = <T>(props: T): T => {
  if (props && typeof props === 'object' && 'componentRef' in props) {
    const { componentRef: _componentRef, ...rest } = props as Record<string, unknown>;
    return rest as T;
  }
  return props;
};

export const FocusZone = phasedComponent((props: FocusZoneProps) => {
  const { componentRef, defaultTabbableElement, isCircularNavigation, ...rest } = props;

  const ftzRef = useViewCommandFocus(componentRef);

  const [targetFirstFocus, setTargetFirstFocus] = React.useState<number | string>(undefined);
  React.useLayoutEffect(() => {
    if (typeof defaultTabbableElement === 'string') {
      setTargetFirstFocus(defaultTabbableElement);
    } else if (defaultTabbableElement?.current) {
      setTargetFirstFocus(findNodeHandle(defaultTabbableElement.current));
    } else {
      setTargetFirstFocus(undefined);
    }
  }, [defaultTabbableElement]);

  const rootProps = {
    navigateAtEnd: isCircularNavigation ? 'NavigateWrap' : 'NavigateStopAtEnds', // let rest override
    ...rest,
    defaultTabbableElement: targetFirstFocus,
    ref: ftzRef,
  } as NativeProps;

  // The FocusZone has no styling of its own, so the final render is simply the native root slot.
  return useSlot<NativeProps>(RCTFocusZone as unknown as React.ComponentType<NativeProps>, rootProps, filterOutComponentRef);
});

FocusZone.displayName = focusZoneName;
