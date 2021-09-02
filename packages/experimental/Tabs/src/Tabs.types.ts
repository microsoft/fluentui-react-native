import * as React from 'react';
import { View, ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import { FontTokens, IForegroundColorTokens, IBackgroundColorTokens } from '@fluentui-react-native/tokens';

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
}

export interface TabsTokens extends IForegroundColorTokens, FontTokens, IBackgroundColorTokens {}

export interface TabsProps extends Pick<FocusZoneProps, 'isCircularNavigation'>, ViewProps {
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

  defaultTabbableElement?: any;

  testID?: string;
}

export interface TabsInfo {
  headersOnly?: boolean;
  label?: boolean;
}

export interface TabsState {
  props: TabsProps;
  state: {
    context?: TabsContextData;
    info: TabsInfo;
  };
}
export interface TabsSlotProps {
  root: React.PropsWithRef<ViewProps>;
  label: TextProps;
  container: FocusZoneProps;
  stack: ViewProps;
  tabPanel: ViewProps;
}

export interface TabsType {
  props: TabsProps;
  tokens: TabsTokens;
  slotProps: TabsSlotProps;
  state: TabsState;
}
