import * as React from 'react';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { IFocusable } from '../../hooks';

export interface IFocusTrapZoneProps extends IViewWin32Props {
  /**
   * A RefObject to access the IFocusTrapZone interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
  /**
   * Specifies whether the FocusTrapZone's focus trapping behavior is disabled. True, if disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Specifies whether the FocusTrapZone takes focus on render. True, if taking focus is disabled.
   * @default false
   */
  disableFirstFocus?: boolean;
  /**
   * Determines which element receives focus when focus moves into the FocusTrapZone. If false, the first focusable descendant gets focus.
   * If true, the element that was focused when the FocusTrapZone last had a focused descendant is chosen. If it has never had a focused
   * descendant before, then the first focusable descendant gets focus.
   * @default false
   */
  focusPreviouslyFocusedInnerElement?: boolean;
  /**
   * By default, when the FocusTrapZone is unmounted or disabled focus returns to the element outside the FocusTrapZone that last had
   * focus. Setting this to true disables this behavior, so the UI behaves as it normally would: If the FocusTrapZone is disabled, focus
   * remains on the control inside the FocusTrapZone. If the FocusTrapZone is unmounted, focus usually moves to the nearest focusable
   * control, but this can vary.
   * @default false
   */
  ignoreExternalFocusing?: boolean;
}

export interface IFocusTrapZoneSlotProps {
  root: React.PropsWithRef<Omit<IFocusTrapZoneProps, 'componentRef'>>;
}

export interface IFocusTrapZoneType {
  props: IFocusTrapZoneProps;
  slotProps: IFocusTrapZoneSlotProps;
}
