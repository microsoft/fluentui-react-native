import { TabsContextData, TabsInfo } from './Tabs.types';

export interface WinTabsContextData extends TabsContextData {
  /**
   * GH #964, Reference to the Focus Container as there is no FocusZone on windows.
   */
  focusZoneRef: React.RefObject<any> | null;

  /**
   * Array of enabled keys in the group
   */
  enabledKeys?: string[];
}

export interface TabsState {
  context: WinTabsContextData;
  info: TabsInfo;
}
