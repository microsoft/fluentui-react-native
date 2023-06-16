import type { TabProps, TabInfo } from './Tab.types';

/**
 * Re-usable hook for TabsItem.
 * This hook configures tabs item props and state for TabsItem.
 *
 * @param props user props sent to TabsItem
 * @returns configured props and state for TabsItem
 */
export const useTab = (props: TabProps): TabInfo => {
  return {
    props: props,
    state: {},
  };
};
