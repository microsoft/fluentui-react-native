/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import type { IUseStyling } from '@uifabricshared/foundation-composable';
import { composable } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import type { FocusZoneProps, FocusZoneSlotProps, FocusZoneType } from './FocusZone.types';
import RCTFocusZone from './FocusZoneNativeComponent';

const filterOutComponentRef = (propName) => propName !== 'componentRef';

export const FocusZone = composable<FocusZoneType>({
  usePrepareProps: (userProps: FocusZoneProps, useStyling: IUseStyling<FocusZoneType>) => {
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

    return {
      slotProps: mergeSettings<FocusZoneSlotProps>(useStyling(userProps), {
        root: {
          navigateAtEnd: isCircularNavigation ? 'NavigateWrap' : 'NavigateStopAtEnds', // let rest override
          ...rest,
          defaultTabbableElement: targetFirstFocus,
          ref: ftzRef,
        },
      }),
    };
  },
  slots: {
    root: { slotType: RCTFocusZone, filter: filterOutComponentRef },
  },
});
