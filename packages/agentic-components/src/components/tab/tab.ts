import type { TabProps } from './tab.types';
import { useTab_unstable } from './useTab';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderTab_unstable } from './renderTab';

/**
 * A Tab component for switching between content panels within a tablist.
 */
export const Tab = (props: TabProps) => {
  const state = useTab_unstable(props);
  useApplyStyles_unstable(state);
  return renderTab_unstable(state);
};
Tab.displayName = 'Tab';

export default Tab;
