/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import * as React from 'react';
import { findNodeHandle } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { FocusZoneProps, FocusZoneState, FocusZoneTokens } from './FocusZone.types';
import { focusZoneName } from './FocusZone.types';
import RCTFocusZone from './FocusZoneNativeComponent';
import type { NativeProps } from './FocusZoneNativeComponent';

interface FocusZoneTypeInternal {
  props: FocusZoneProps;
  tokens: FocusZoneTokens;
  slotProps: { root: React.PropsWithRef<NativeProps> };
  state: FocusZoneState;
}

export const FocusZone = compose<FocusZoneTypeInternal>({
  displayName: focusZoneName,
  slots: { root: RCTFocusZone },
  useRender: (userProps: FocusZoneProps, useSlots: UseSlots<FocusZoneTypeInternal>) => {
    const { componentRef, defaultTabbableElement, isCircularNavigation, ...rest } = userProps;

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
      navigateAtEnd: isCircularNavigation ? 'NavigateWrap' : 'NavigateStopAtEnds',
      ...rest,
    } as NativeProps;

    const Root = useSlots(userProps).root;
    return (restProps: FocusZoneProps) => {
      return React.createElement(Root, {
        ...mergeProps(rootProps, restProps as NativeProps),
        defaultTabbableElement: targetFirstFocus,
        ref: ftzRef,
      });
    };
  },
});
