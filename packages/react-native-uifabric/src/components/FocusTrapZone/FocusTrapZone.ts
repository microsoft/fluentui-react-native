import { IFocusTrapZoneProps, IFocusTrapZoneSlotProps, IFocusTrapZoneType } from './FocusTrapZone.types';
import { requireNativeComponent } from 'react-native';
import { IUseStyling, composable } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useViewCommandFocus } from '../../hooks';

const RCTFocusTrapZone = requireNativeComponent('RCTFocusTrapZone');

export function filterOutComponentRef(propName: string): boolean {
  return propName !== 'componentRef';
}

export const FocusTrapZone = composable<IFocusTrapZoneType>({
  usePrepareProps: (userProps: IFocusTrapZoneProps, useStyling: IUseStyling<IFocusTrapZoneType>) => {
    const ftzRef = useViewCommandFocus(userProps.componentRef);
    return {
      slotProps: mergeSettings<IFocusTrapZoneSlotProps>(useStyling(userProps), { root: { ...userProps, ref: ftzRef } })
    };
  },
  slots: {
    root: { slotType: RCTFocusTrapZone, filter: filterOutComponentRef }
  }
});
