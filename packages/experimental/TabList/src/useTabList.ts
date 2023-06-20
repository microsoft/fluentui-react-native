import type { TabListProps, TabListInfo } from './TabList.types';

/**
 * Re-usable hook for Tabs.
 * This hook configures tabs props and state for Tabs.
 *
 * @param props user props sent to Tabs
 * @returns configured props and state for Tabs
 */
export const useTabList = (props: TabListProps): TabListInfo => {
  return {
    props: props,
    state: {},
  };
};
