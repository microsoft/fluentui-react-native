import type * as React from 'react';
import type { View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import type { FontTokens, IForegroundColorTokens, IBackgroundColorTokens } from '@fluentui-react-native/tokens';

export const tabListName = 'TabList';

export interface TabListContextData {
  /**
   * The currently selected Tab's key
   */
  selectedKey: string;

  /**
   * Updates the selected Tab and calls the client’s onTabSelect callback
   */
  onTabSelect?: (key: string) => void;

  /**
   * Updates the selected Tab's ref to set as the default tabbable element
   */
  updateSelectedTabsItemRef?: (ref: React.RefObject<any>) => void;

  /**
   * Array of Tab values in the group
   */
  tabKeys?: string[];

  /**
   * Reference to the Focus Container as there is no FocusZone on windows.
   * GH #964
   */
  focusZoneRef?: React.RefObject<any> | null;
}

export interface TabListTokens extends IForegroundColorTokens, FontTokens, IBackgroundColorTokens {}

export type TabListAppearance = 'transparent' | 'subtle';
export type TabListSize = 'small' | 'medium' | 'large';

export interface TabListProps extends Pick<FocusZoneProps, 'isCircularNavigation' | 'defaultTabbableElement'>, IViewProps {
  /**
   * Visual appearance of the TabList, affecting header hover / selection background.
   */
  appearance?: TabListAppearance;

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

  /**
   * Flag to render the list of tabs horizontally or vertically
   */
  vertical?: boolean;

  /**
   * A RefObject to access TabList.
   */
  componentRef?: React.RefObject<View>;

  testID?: string;
}

export interface TabListState {
  context?: TabListContextData;

  /**
   * Array of enabled keys in the group
   * Windows-Specific Prop.
   */
  enabledKeys?: string[];
}
export interface TabListInfo {
  props: TabListProps;
  state: TabListState;
}
export interface TabListSlotProps {
  root: React.PropsWithRef<IViewProps>;
  container?: FocusZoneProps;
  stack: IViewProps;
}

export interface TabListType {
  props: TabListProps;
  tokens: TabListTokens;
  slotProps: TabListSlotProps;
  state: TabListState;
}
