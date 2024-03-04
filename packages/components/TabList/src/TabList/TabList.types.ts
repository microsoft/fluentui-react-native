import type * as React from 'react';
import type { View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import type { LayoutTokens } from '@fluentui-react-native/tokens';
import type { LayoutRectangle } from '@office-iss/react-native-win32';

import type { AnimatedIndicatorStyles } from '../TabListAnimatedIndicator/TabListAnimatedIndicator.types';

export const tabListName = 'TabList';

export type TabListAppearance = 'transparent' | 'subtle';
export type TabListSize = 'small' | 'medium' | 'large';
export interface TabListLayoutInfo {
  tablist: LayoutRectangle;
  tabs: { [key: string]: LayoutRectangle };
}

export interface TabListState {
  /**
   * Method to add tabKey to context's `tabKeys` list. Run once on a tab mounting.
   */
  addTabKey: (tabKey: string) => void;

  /**
   * Method to add Tab's layout information for animating the tab indicator
   */
  addTabLayout?: (tabKey: string, layout: LayoutRectangle) => void;

  /**
   * Global state both TabList and Tab use for tracking styling of the animated indicator.
   *
   * This is the styling of each of the slots, excluding layout-set styles calculated in `useAnimatedIndicatorStyles`.
   */
  animatedIndicatorStyles?: AnimatedIndicatorStyles;

  /**
   * TabList's `appearance` prop passed to its children.
   */
  appearance: TabListAppearance;

  /**
   * Flag indicating whether the animated indicator has correct layout styles such that we can render it.
   */
  canShowAnimatedIndicator: boolean;

  /**
   * TabList's `disabled` prop
   */
  disabled: boolean;

  /**
   * Flag to indicate whether a Tab has been clicked and selected.
   * @platform win32
   */
  invoked?: boolean;

  /**
   * Stores the layout rect of the tablist and the layout rects + some tokens of each tab. Used to style the animated indicator.
   */
  layout?: TabListLayoutInfo;

  /**
   * Updates the selected Tab and calls the client’s onTabSelect callback
   */
  onTabSelect: (key: string) => void;

  /**
   * Method to remove a tabKey from a context's `tabKeys` list. Run once when the tab unmounts.
   */
  removeTabKey: (tabKey: string) => void;

  /**
   * The currently selected Tab's key.
   */
  selectedKey: string;

  /**
   * Setter for the context's `invoked` flag.
   * @platform win32
   */
  setInvoked?: (invoked: boolean) => void;

  /**
   * Setter for the focused Tab's ref to set as the default tabbable element in the FocusZone
   */
  setFocusedTabRef: (ref: React.RefObject<any>) => void;

  /**
   * TabList's `size` prop.
   */
  size: TabListSize;

  /**
   * Array of Tab values in the group
   */
  tabKeys: string[];

  /**
   * Directly update the animated indicator's styles with styles the user supplies for each slot.
   */
  updateAnimatedIndicatorStyles?: (updates: AnimatedIndicatorStyles) => void;

  /**
   * Updates internal map that keeps track of each of this tablist's tabs disabled state
   */
  updateDisabledTabs: (tabKey: string, isDisabled: boolean) => void;

  /**
   * Updates internal map that keeps track of each of this tablist's tabs' refs.
   */
  updateTabRef: (tabKey: string, ref: React.RefObject<View>) => void;

  /**
   * TabList's `vertical` prop.
   */
  vertical: boolean;
}

export interface TabListTokens extends LayoutTokens {
  /**
   * Controls direction of TabList items, controlled by 'vertical' prop
   */
  direction?: 'row' | 'column';
  /**
   * States
   */
  vertical?: TabListTokens;
}

export interface TabListProps extends Pick<FocusZoneProps, 'isCircularNavigation' | 'defaultTabbableElement'>, IViewProps {
  /**
   * Visual appearance of the TabList, affecting header hover / selection background.
   */
  appearance?: TabListAppearance;

  /**
   * A RefObject to access TabList.
   */
  componentRef?: React.RefObject<View>;

  /**
   * The key of the Tab that will initially be selected
   */
  defaultSelectedKey?: string;

  /**
   * Flag to disable all tabs
   */
  disabled?: boolean;

  /**
   * Callback for receiving a notification when the choice has been changed
   */
  onTabSelect?: (key: string) => void;

  /**
   * The value of the selected option. If you provide this, you must maintain selection state by observing
   * onTabSelect events and passing a new value in when changed. This overrides defaultSelectedKey
   * and makes the TabList a controlled component. This prop is mutually exclusive to defaultSelectedKey.
   */
  selectedKey?: string;

  /**
   * Flag to change the size of the tabs.
   */
  size?: TabListSize;

  testID?: string;

  /**
   * Flag to render the list of tabs horizontally or vertically
   */
  vertical?: boolean;
}
export interface TabListInfo {
  props: TabListProps;
  state: TabListState;
}
export interface TabListSlotProps {
  container?: FocusZoneProps;
  stack: IViewProps;
  root: React.PropsWithRef<IViewProps>;
}

export interface TabListType {
  props: TabListProps;
  tokens: TabListTokens;
  slotProps: TabListSlotProps;
  state: TabListState;
}
