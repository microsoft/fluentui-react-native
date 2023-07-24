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
  const {
    accessible,
    disabled = false,
    appearance = 'transparent',
    componentRef = defaultComponentRef,
    isCircularNavigation,
    selectedKey,
    onTabSelect,
    defaultSelectedKey,
    size = 'medium',
    vertical = false,
  } = props;

  const data = useSelectedKey(selectedKey || defaultSelectedKey || null, onTabSelect);

  // selectedTabRef should be set to default tabbable element.
  const [selectedTabRef, setSelectedTabRef] = React.useState(React.useRef<View>(null));

  const onSelectTabRef = React.useCallback(
    (ref: React.RefObject<View>) => {
      setSelectedTabRef(ref);
    },
    [setSelectedTabRef],
  );

  const state: TabListState = {
    context: {
      appearance: appearance,
      disabled: disabled,
      onTabSelect: data.onKeySelect,
      selectedKey: selectedKey ?? data.selectedKey,
      size: size,
      updateSelectedTabRef: onSelectTabRef,
      vertical: vertical,
    },
  };

  return {
    props: {
      ...props,
      accessible: accessible ?? true,
      accessibilityRole: 'tablist',
      appearance: appearance,
      componentRef: componentRef,
      defaultTabbableElement: selectedTabRef,
      isCircularNavigation: isCircularNavigation ?? false,
      size: size,
      vertical: vertical,
    },
    state: { ...state },
  };
};
