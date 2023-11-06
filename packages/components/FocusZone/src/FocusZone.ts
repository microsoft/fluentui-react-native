import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import type { IUseStyling } from '@uifabricshared/foundation-composable';
import { composable } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import type { FocusZoneProps, FocusZoneSlotProps, FocusZoneType } from './FocusZone.types';

const RCTFocusZone = ensureNativeComponent('RCTFocusZone');

const filterOutComponentRef = (propName) => propName !== 'componentRef';

export const FocusZone = composable<FocusZoneType>({
  usePrepareProps: (userProps: FocusZoneProps, useStyling: IUseStyling<FocusZoneType>) => {
    const { componentRef, defaultTabbableElement, isCircularNavigation, ...rest } = userProps;

    const ftzRef = useViewCommandFocus(componentRef);

    const [targetNativeTag, setTargetNativeTag] = React.useState<number>(undefined);
    React.useLayoutEffect(() => {
      if (defaultTabbableElement?.current) {
        setTargetNativeTag(findNodeHandle(defaultTabbableElement.current));
      } else {
        setTargetNativeTag(undefined);
      }
    }, [defaultTabbableElement]);

    return {
      slotProps: mergeSettings<FocusZoneSlotProps>(useStyling(userProps), {
        root: {
          navigateAtEnd: isCircularNavigation ? 'NavigateWrap' : 'NavigateStopAtEnds', // let rest override
          ...rest,
          defaultTabbableElement: targetNativeTag,
          ref: ftzRef,
        },
      }),
    };
  },
  slots: {
    root: { slotType: RCTFocusZone, filter: filterOutComponentRef },
  },
});
