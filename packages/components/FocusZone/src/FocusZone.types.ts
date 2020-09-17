import * as React from 'react';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export const focusZoneName = 'FocusZone';

export interface IFocusZoneState { }

export interface IFocusZoneProps {

  /**
  * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
  */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Optionally defines the initial tabbable element inside the FocusZone
   */
  defaultTabbableElement?: React.RefObject<React.Component>;

  /**
   ** Defines which arrows to react to
   */
  focusZoneDirection?: FocusZoneDirection;

  /**
   ** If set, the FocusZone will not be tabbable and keyboard navigation will be disabled
   */
  disabled?: boolean;

  /**
   * Determines navigation at beginning/end of FocusZone
   */
  navigateAtEnd?: NavigateAtEnd;

  /**
   *Allows for 2D navigation. This navigation strategy takes into account the position of elements
   on screen, and navigates in the direction the user selects to the nearest element.
   */
  is2DNavigation?: boolean;

  /**
   * Callback called when “focus” event triggered in FocusZone
   */
  onFocus?: (e?: any) => void;
}

export enum FocusZoneDirection {
  /** React to all arrows. */
  bidirectional = 0,

  /** Only react to up/down arrows. */
  vertical = 1,

  /** Only react to left/right arrows. */
  horizontal = 2,

  /** Doesn't respond to any arrow keys. */
  none = 3
}

export enum NavigateAtEnd {
  /* At the last element of the FocusZone, focus will move to the first focusable element outside the FocusZone */
  NavigateNormal = 0,

  /* Focus will stay on the last element in the FocusZone. Only way to navigate out is Tab */
  NavigateStopAtEnds = 1,

  /* Wll cycle to the beginning of the targets once the user navigates to the next target
   * while at the end, and to the end when navigate to the previous at the beginning */
  NavigateWrap = 2
}

export interface IFocusZoneTokens { }

export interface IFocusZoneSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
}

export type IFocusZoneRenderData = IRenderData<IFocusZoneSlotProps, IFocusZoneState>;

export interface IFocusZoneType {
  props: IFocusZoneProps;
  tokens: IFocusZoneTokens;
  slotProps: IFocusZoneSlotProps;
  state: IFocusZoneState;
}