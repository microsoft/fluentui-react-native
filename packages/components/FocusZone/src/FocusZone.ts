import * as React from 'react';
import { findNodeHandle } from 'react-native';
import { IFocusZoneProps, IFocusZoneSlotProps, IFocusZoneType } from './FocusZone.types';
import { IUseStyling, composable } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { filterOutComponentRef } from '../../FocusTrapZone';


const RCTFocusZone = ensureNativeComponent('RCTFocusZone');

export const FocusZone = composable<IFocusZoneType>({
  usePrepareProps: (userProps: IFocusZoneProps, useStyling: IUseStyling<IFocusZoneType>) => {
    const { componentRef, defaultTabbableElement, ...rest } = userProps;

    const ftzRef = useViewCommandFocus(componentRef);

    const [targetNativeTag, setTargetNativeTag] = React.useState<number>(undefined);
    React.useLayoutEffect(() => {
      if (defaultTabbableElement?.current) {
        setTargetNativeTag(findNodeHandle(defaultTabbableElement.current));
      }
    }, [defaultTabbableElement]);

    return {
      slotProps: mergeSettings<IFocusZoneSlotProps>(useStyling(userProps), { root: { ...rest, defaultTabbableElement: targetNativeTag, ref: ftzRef } }),
    };
  },
  slots: {
    root: { slotType: RCTFocusZone, filter: filterOutComponentRef },
  },
});