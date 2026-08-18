import type { ViewProps } from 'react-native';

/** A single item within a PopUpButton's menu. */
export interface PopUpButtonItem {
  /** Text label shown for this item. */
  title: string;
  /** Identifier reported back via onChange; defaults to `title` if omitted. */
  identifier?: string;
  /** Whether this item can be selected. Defaults to true. */
  enabled?: boolean;
}

/**
 * Thin wrapper around the AppKit `NSPopUpButton` control (a native "select"/dropdown).
 * https://developer.apple.com/documentation/appkit/nspopupbutton
 */
export interface PopUpButtonProps extends ViewProps {
  /** The items to render in the button's menu, in order. */
  items: PopUpButtonItem[];
  /** Index of the currently selected item. */
  selectedIndex?: number;
  /** Renders as a pull-down (action) menu instead of a pop-up (selection) menu. Defaults to false. */
  pullsDown?: boolean;
  /** Disables user interaction with the control. */
  disabled?: boolean;
  /** Native tooltip shown on hover. */
  tooltip?: string;
  /** Fired when the user selects an item. */
  onChange?: (selectedIndex: number, identifier: string) => void;
}
