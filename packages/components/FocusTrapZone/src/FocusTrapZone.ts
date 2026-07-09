/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import type { IUseStyling } from '@uifabricshared/foundation-composable';
import { composable } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import type { IFocusTrapZoneProps, IFocusTrapZoneSlotProps, IFocusTrapZoneType } from './FocusTrapZone.types';
import RCTFocusTrapZone from './FocusTrapZoneNativeComponent';

export function filterOutComponentRef<T>(props: T): T {
  if (props && typeof props === 'object' && 'componentRef' in props) {
    const { componentRef: _componentRef, ...rest } = props as Record<string, unknown>;
    return rest as T;
  }
  return props;
}

export const FocusTrapZone = composable<IFocusTrapZoneType>({
  usePrepareProps: (userProps: IFocusTrapZoneProps, useStyling: IUseStyling<IFocusTrapZoneType>) => {
    const ftzRef = useViewCommandFocus(userProps.componentRef);
    return {
      slotProps: mergeSettings<IFocusTrapZoneSlotProps>(useStyling(userProps), { root: { ...userProps, ref: ftzRef } }),
    };
  },
  slots: {
    root: { slotType: RCTFocusTrapZone, filter: filterOutComponentRef },
  },
});
