import * as React from 'react';

import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

import type { TabsProps, TabsState, TabsInfo } from './Tabs.types';

/**
 * Re-usable hook for Tabs.
 * This hook configures tabs props and state for Tabs.
 *
 * @param props user props sent to Tabs
 * @returns configured props and state for Tabs
 */
export const useTabs = (props: TabsProps): TabsInfo => {
  const defaultComponentRef = React.useRef(null);
  const focusZoneRef = React.useRef(null);
  const {
    accessible,
    componentRef = defaultComponentRef,
    selectedKey,
    getTabId,
    onTabsClick,
    defaultSelectedKey,
    isCircularNavigation,
    headersOnly,
    label,
  } = props;

  const data = useSelectedKey(selectedKey || defaultSelectedKey || null, onTabsClick);

  const findTabId = React.useCallback(
    (key: string, index: number) => {
      if (getTabId) {
        return getTabId(key, index);
      }
      return `${key}-Tab${index}`;
    },
    [getTabId],
  );

  // Stores views to be displayed.
  const map = new Map<string, React.ReactNode[]>();

  const state: TabsState = {
    context: {
      selectedKey: selectedKey ?? data.selectedKey,
      onTabsClick: data.onKeySelect,
      getTabId: findTabId,
      views: map,
      focusZoneRef: focusZoneRef,
    },
    headersOnly: headersOnly ?? false,
    label: !!label,
  };

  return {
    props: {
      ...props,
      accessible: accessible ?? true,
      accessibilityRole: 'tablist',
      componentRef: componentRef,
      isCircularNavigation: isCircularNavigation ?? false,
    },
    state: {
      ...state,
    },
  };
};
