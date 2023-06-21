import * as React from 'react';
import type { View } from 'react-native';

import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

import type { TabListProps, TabListInfo, TabListState } from './TabList.types';

/**
 * Re-usable hook for Tabs.
 * This hook configures tabs props and state for Tabs.
 *
 * @param props user props sent to Tabs
 * @returns configured props and state for Tabs
 */
export const useTabList = (props: TabListProps): TabListInfo => {
  const defaultComponentRef = React.useRef(null);
  const { accessible, componentRef = defaultComponentRef, isCircularNavigation, selectedKey, onTabSelect, defaultSelectedKey } = props;

  const data = useSelectedKey(selectedKey || defaultSelectedKey || null, onTabSelect);

  // selectedTabRef should be set to default tabbale element.
  const [selectedTabRef, setSelectedTabRef] = React.useState(React.useRef<View>(null));

  const onSelectTabRef = React.useCallback(
    (ref: React.RefObject<View>) => {
      setSelectedTabRef(ref);
    },
    [setSelectedTabRef],
  );

  const state: TabListState = {
    context: {
      selectedKey: selectedKey ?? data.selectedKey,
      onTabSelect: data.onKeySelect,
      updateSelectedTabRef: onSelectTabRef,
    },
  };

  return {
    props: {
      ...props,
      accessible: accessible ?? true,
      accessibilityRole: 'tablist',
      componentRef: componentRef,
      defaultTabbableElement: selectedTabRef,
      isCircularNavigation: isCircularNavigation ?? false,
    },
    state: { ...state },
  };
};
