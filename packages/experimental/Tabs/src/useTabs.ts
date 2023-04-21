import * as React from 'react';
import type { View } from 'react-native';

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
  const { accessible, componentRef = defaultComponentRef, selectedKey, getTabId, onTabsClick, defaultSelectedKey } = props;

  const data = useSelectedKey(selectedKey || defaultSelectedKey || null, onTabsClick);

  // selectedTabsItemRef should be set to default tabbale element.
  const [selectedTabsItemRef, setSelectedTabsItemRef] = React.useState(React.useRef<View>(null));

  const onSelectTabsItemRef = React.useCallback(
    (ref: React.RefObject<View>) => {
      setSelectedTabsItemRef(ref);
    },
    [setSelectedTabsItemRef],
  );

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
      updateSelectedTabsItemRef: onSelectTabsItemRef,
      views: map,
    },
    headersOnly: props.headersOnly ?? false,
    label: !!props.label,
  };

  return {
    props: {
      ...props,
      accessible: accessible ?? true,
      accessibilityRole: 'tablist',
      componentRef: componentRef,
      defaultTabbableElement: selectedTabsItemRef,
      isCircularNavigation: props.isCircularNavigation ?? false,
    },
    state: {
      ...state,
    },
  };
};
