import type * as React from 'react';
import type { View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import type { TextProps } from '@fluentui-react-native/text';
import type { FontTokens, IForegroundColorTokens, IBackgroundColorTokens } from '@fluentui-react-native/tokens';

export const tabsName = 'Tabs';

export interface TabsContextData {
  /**
   * The currently selected TabsItem's key
   */
  selectedKey: string | null;

  /**
   * Index of currently selected key
   */
  getTabId?: (key: string, index: number) => string | null;

  /**
   * Updates the selected tabsItem and calls the client’s onTabsClick callback
   */
  onTabsClick?: (key: string) => void;

  /**
   * Updates the selected tabsItem's ref to set as the default tabbable element
   */
  updateSelectedTabsItemRef?: (ref: React.RefObject<any>) => void;

  /**
   * Array of tabsItem keys in the group
   */
  tabsItemKeys?: string[];

  /**
   * A Map to for a TabItems corresponding view
   */
  views?: Map<string, React.ReactNode[]> | null;

  /**
   * Reference to the Focus Container as there is no FocusZone on windows.
   * GH #964
   */
  focusZoneRef?: React.RefObject<any> | null;
}

export interface TabsTokens extends IForegroundColorTokens, FontTokens, IBackgroundColorTokens {}

export interface TabsProps extends Pick<FocusZoneProps, 'isCircularNavigation' | 'defaultTabbableElement'>, IViewProps {
  /**
   * Descriptive label for the Tabs. This will be displayed as the title of the Tabs to the user
   */
  label?: string;

  /**
   * The key of the TabsItem that will initially be selected
   */
  defaultSelectedKey?: string;

  /**
   * The key of the selected option. If you provide this, you must maintain selection state by observing
   * onTabsClick events and passing a new value in when changed. This overrides defaultSelectedKey
   * and makes the Tabs a controlled component. This prop is mutually exclusive to defaultSelectedKey.
   */
  selectedKey?: string;

  /**
   * Callback for receiving a notification when the choice has been changed
   */
  onTabsClick?: (key: string) => void;

  /**
   * Callback to customize how IDs are generated for each tab header.
   * Useful if you're rendering content outside and need to connect accessibility-labelledby.
   */
  getTabId?: (key: string, index: number) => string;

  /**
   * Sets whether to only render the header
   */
  headersOnly?: boolean;

  /**
   * A RefObject to access Tabs.
   */
  componentRef?: React.RefObject<View>;

  testID?: string;
}

export interface TabsState {
  context?: TabsContextData;
  headersOnly?: boolean;
  label?: boolean;

  /**
   * Array of enabled keys in the group
   * Windows-Specific Prop.
   */
  enabledKeys?: string[];
}
export interface TabsInfo {
  props: TabsProps;
  state: TabsState;
}
export interface TabsSlotProps {
  root: React.PropsWithRef<IViewProps>;
  label: TextProps;
  container?: FocusZoneProps;
  stack: IViewProps;
  tabPanel: IViewProps;
}

export interface TabsType {
  props: TabsProps;
  tokens: TabsTokens;
  slotProps: TabsSlotProps;
  state: TabsState;
}
