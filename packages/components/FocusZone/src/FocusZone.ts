import * as React from 'react';
import { findNodeHandle } from 'react-native';
import { FocusZoneProps, FocusZoneSlotProps, FocusZoneType } from './FocusZone.types';
import { IUseStyling, composable } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

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
          ...rest,
          defaultTabbableElement: targetNativeTag,
          ref: ftzRef,
          navigateAtEnd: isCircularNavigation ? 'NavigateWrap' : 'NavigateStopAtEnds',
        },
      }),
    };
  },
  slots: {
    root: { slotType: RCTFocusZone, filter: filterOutComponentRef },
  },
});
