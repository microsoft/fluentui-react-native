import * as React from 'react';
import type { View, AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

import type { TabListInfo, TabListState, TabListProps } from './TabList.types';
import { useTabListAnimatedIndicatorState } from '../TabListAnimatedIndicator/useTabListAnimatedIndicatorState';

/**
 * Re-usable hook for TabList.
 * This hook configures props and state for TabList.
 *
 * @param props user props sent to TabList
 * @returns configured props and state for TabList
 */
export const useTabList = (props: TabListProps): TabListInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    accessible,
    appearance = 'transparent',
    accessibilityState,
    componentRef = defaultComponentRef,
    defaultSelectedKey,
    disabled = false,
    isCircularNavigation,
    onTabSelect,
    selectedKey,
    size = 'medium',
    vertical = false,
  } = props;

  const data = useSelectedKey(selectedKey || defaultSelectedKey || null, onTabSelect);

  // selectedTabRef should be set to default tabbable element.
  const [selectedTabRef, setSelectedTabRef] = React.useState(React.useRef<View>(null));
  const [invoked, setInvoked] = React.useState(false);
  const [tabKeys, setTabKeys] = React.useState<string[]>([]);

  const addTabKey = React.useCallback(
    (tabKey: string) => {
      if (__DEV__ && tabKeys.includes(tabKey)) {
        console.warn(`Tab Key "${tabKey}" already exists in the TabList. Duplicate keys are not supported.`);
      }
      setTabKeys((keys) => [...keys, tabKey]);
    },
    [tabKeys, setTabKeys],
  );

  const removeTabKey = React.useCallback(
    (tabKey: string) => {
      setTabKeys((keys) => keys.filter((key) => key !== tabKey));
    },
    [setTabKeys],
  );

  // Logic to style the animated indicator
  const [animatedIndicatorState, onStackLayout] = useTabListAnimatedIndicatorState(props, selectedKey ?? data.selectedKey);

  const state: TabListState = {
    context: {
      addTabKey: addTabKey,
      animatedIndicatorState: animatedIndicatorState,
      appearance: appearance,
      disabled: disabled,
      invoked: invoked,
      onTabSelect: data.onKeySelect,
      removeTabKey: removeTabKey,
      selectedKey: selectedKey ?? data.selectedKey,
      setSelectedTabRef: setSelectedTabRef,
      setInvoked: setInvoked,
      size: size,
      tabKeys: tabKeys,
      vertical: vertical,
    },
  };

  return {
    props: {
      ...props,
      accessible: accessible ?? true,
      accessibilityState: getAccessibilityState(disabled, accessibilityState),
      accessibilityRole: 'tablist',
      appearance: appearance,
      componentRef: componentRef,
      defaultTabbableElement: selectedTabRef,
      isCircularNavigation: isCircularNavigation ?? false,
      onLayout: onStackLayout,
      size: size,
      vertical: vertical,
    },
    state: { ...state },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState): AccessibilityState {
  if (accessibilityState) {
    return { disabled, ...accessibilityState };
  }
  return { disabled };
}
