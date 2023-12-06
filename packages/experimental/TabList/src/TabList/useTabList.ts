import * as React from 'react';
import type { View, AccessibilityState, LayoutRectangle } from 'react-native';

import { memoize, mergeStyles } from '@fluentui-react-native/framework';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

import type { TabListInfo, TabListProps } from './TabList.types';
import type { AnimatedIndicatorStyles, TabLayoutInfo } from '../TabListAnimatedIndicator/TabListAnimatedIndicator.types';

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

  // State variables and functions for saving layout info and other styling information to style the animated indicator.
  const [listLayoutMap, setListLayoutMap] = React.useState<{ [key: string]: TabLayoutInfo }>({});
  const [tabListLayout, setTabListLayout] = React.useState<LayoutRectangle>();
  const [userDefinedAnimatedIndicatorStyles, setUserDefinedAnimatedIndicatorStyles] = React.useState<AnimatedIndicatorStyles>({});

  const addTabLayout = React.useCallback(
    (tabKey: string, layoutInfo: TabLayoutInfo) => {
      setListLayoutMap((prev) => ({ ...prev, [tabKey]: layoutInfo }));
    },
    [setListLayoutMap],
  );

  const updateStyles = React.useCallback(
    (update: AnimatedIndicatorStyles) => {
      setUserDefinedAnimatedIndicatorStyles((prev) => mergeStyles(prev, update));
    },
    [setUserDefinedAnimatedIndicatorStyles],
  );

  // TabList layout callback used to style the animated indicator.
  const onTabListLayout = React.useCallback(
    (e: LayoutEvent) => {
      if (e.nativeEvent.layout) {
        setTabListLayout(e.nativeEvent.layout);
      }
    },
    [setTabListLayout],
  );

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
      onLayout: onTabListLayout,
      size: size,
      vertical: vertical,
    },
    state: {
      addTabKey: addTabKey,
      addTabLayout: addTabLayout,
      animatedIndicatorStyles: userDefinedAnimatedIndicatorStyles,
      appearance: appearance,
      canShowAnimatedIndicator: !!(userDefinedAnimatedIndicatorStyles && listLayoutMap && listLayoutMap[selectedKey ?? data.selectedKey]),
      disabled: disabled,
      invoked: invoked,
      layout: {
        tablist: tabListLayout,
        tabs: listLayoutMap,
      },
      onTabSelect: data.onKeySelect,
      removeTabKey: removeTabKey,
      selectedKey: selectedKey ?? data.selectedKey,
      setSelectedTabRef: setSelectedTabRef,
      setInvoked: setInvoked,
      size: size,
      tabKeys: tabKeys,
      vertical: vertical,
      updateAnimatedIndicatorStyles: updateStyles,
    },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState): AccessibilityState {
  if (accessibilityState) {
    return { disabled, ...accessibilityState };
  }
  return { disabled };
}
