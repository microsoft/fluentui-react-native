import * as React from 'react';
import type { View, AccessibilityState, LayoutRectangle } from 'react-native';

import { memoize, mergeStyles } from '@fluentui-react-native/framework';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

import type { TabListInfo, TabListProps, TabLayoutInfo } from './TabList.types';
import type { AnimatedIndicatorStyles, AnimatedIndicatorStylesUpdate } from '../TabListAnimatedIndicator/TabListAnimatedIndicator.types';

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
  const [canShowAnimatedIndicator, setCanShowAnimatedIndicator] = React.useState<boolean>(false);
  const [listLayoutMap, setListLayoutMap] = React.useState<{ [key: string]: TabLayoutInfo }>({});
  const [tabListLayout, setTabListLayout] = React.useState<LayoutRectangle>();
  const [userDefinedAnimatedIndicatorStyles, setUserDefinedAnimatedIndicatorStyles] = React.useState<AnimatedIndicatorStyles>({
    container: {},
    indicator: {},
  });

  const addTabLayout = (tabKey: string, layoutInfo: TabLayoutInfo) => {
    setListLayoutMap((prev) => ({ ...prev, [tabKey]: layoutInfo }));
  };

  const updateStyles = (update: AnimatedIndicatorStylesUpdate) => {
    if (!update.container && !update.indicator) {
      return;
    }
    setUserDefinedAnimatedIndicatorStyles((prev) => {
      const newStyles: AnimatedIndicatorStyles = { ...prev };
      if (update.container) {
        newStyles.container = mergeStyles(prev.container, update.container);
      }
      if (update.indicator) {
        newStyles.indicator = mergeStyles(prev.indicator, update.indicator);
      }
      return newStyles;
    });
  };

  // TabList layout callback used to style the animated indicator.
  const onTabListLayout = (e: LayoutEvent) => {
    if (e.nativeEvent.layout) {
      setTabListLayout(e.nativeEvent.layout);
    }
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
      onLayout: onTabListLayout,
      size: size,
      vertical: vertical,
    },
    state: {
      addTabKey: addTabKey,
      addTabLayout: addTabLayout,
      animatedIndicatorStyles: userDefinedAnimatedIndicatorStyles,
      appearance: appearance,
      canShowAnimatedIndicator: canShowAnimatedIndicator,
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
      setCanShowAnimatedIndicator: setCanShowAnimatedIndicator,
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
