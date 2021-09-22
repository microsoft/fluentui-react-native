import * as React from 'react';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';
import { TabsProps, TabsState, TabsInfo } from './Tabs.types';

/**
 * Re-usable hook for FURN Tabs.
 * This hook configures tabs props and state for FURN Tabs.
 *
 * @param props user props sent to FURN Tabs
 * @returns configured props and state for FURN Tabs
 */
export const useTabs = (props: TabsProps): TabsInfo => {
  const defaultComponentRef = React.useRef(null);
  const { componentRef = defaultComponentRef, selectedKey, getTabId, onTabsClick, defaultSelectedKey, isCircularNavigation, headersOnly, label } = props;

  const data = useSelectedKey(selectedKey || defaultSelectedKey || null, onTabsClick);

  const findTabId = React.useCallback((key: string, index: number) => {
    if (getTabId) {
      return getTabId(key, index);
    }
    return `${key}-Tab${index}`;
  }, [getTabId]);

  // Stores views to be displayed.
  const map = new Map<string, React.ReactNode[]>();

  const state: TabsState = {
    context: {
      selectedKey: selectedKey ?? data.selectedKey,
      onTabsClick: data.onKeySelect,
      getTabId: findTabId,
      views: map,
      focusZoneRef: null,
    },
    headersOnly: headersOnly ?? false,
    label: !!label,
  };


  return {
    props: {
      ...props,
      accessible: true,
      accessibilityRole: 'tablist',
      componentRef: componentRef,
      isCircularNavigation: isCircularNavigation ?? false,
    },
    state: {
      ...state
    },
  };
};
