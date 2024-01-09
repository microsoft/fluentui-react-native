import * as React from 'react';
import type { View, AccessibilityState, LayoutRectangle } from 'react-native';

import { memoize, mergeStyles } from '@fluentui-react-native/framework';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

import type { TabListInfo, TabListProps } from './TabList.types';
import type { AnimatedIndicatorStyles } from '../TabListAnimatedIndicator/TabListAnimatedIndicator.types';

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
  const selectedTabKey = selectedKey ?? data.selectedKey;

  // focusedTabRef should be set to default tabbable element.
  const [focusedTabRef, setFocusedTabRef] = React.useState(React.useRef<View>(null));
  const [invoked, setInvoked] = React.useState(false);
  const [tabKeys, setTabKeys] = React.useState<string[]>([]);
  const [allTabsDisabled, setAllTabsDisabled] = React.useState(false);

  // These maps are used to switch tab focus in the event the selected tab is disabled. React refs are used as storage because updating the maps shouldn't trigger a re-render.
  const tabRefMap = React.useRef<{ [key: string]: React.RefObject<View> }>({}).current;
  const disabledStateMap = React.useRef<{ [key: string]: boolean }>({}).current;

  const updateTabRef = React.useCallback((key: string, ref: React.RefObject<View>) => (tabRefMap[key] = ref), [tabRefMap]);
  const updateDisabledTabs = React.useCallback(
    (key: string, isDisabled: boolean) => {
      disabledStateMap[key] = isDisabled;
      if (allTabsDisabled && !isDisabled) {
        setAllTabsDisabled(false);
      }
    },
    [allTabsDisabled, disabledStateMap],
  );

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
  const [listLayoutMap, setListLayoutMap] = React.useState<{ [key: string]: LayoutRectangle }>({});
  const [tabListLayout, setTabListLayout] = React.useState<LayoutRectangle>();
  const [userDefinedAnimatedIndicatorStyles, setUserDefinedAnimatedIndicatorStyles] = React.useState<AnimatedIndicatorStyles>({});

  const addTabLayout = React.useCallback(
    (tabKey: string, layoutInfo: LayoutRectangle) => {
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

  // If the current selected tab becomes disabled, the following useEffect sets the default focused element to the next non-disabled tab key.
  // Without this, keyboard navigation gets stuck when attempting to tab towards the tablist and every following element after
  const isSelectedTabDisabled = disabledStateMap[selectedTabKey];

  React.useEffect(() => {
    if (isSelectedTabDisabled) {
      // switch focus to the next available tab key
      let tabIndex = tabKeys.indexOf(selectedTabKey);
      for (let i = 0; i < tabKeys.length; i++) {
        tabIndex = (tabIndex + 1) % tabKeys.length;
        if (!disabledStateMap[tabKeys[tabIndex]]) {
          break;
        }
      }
      if (tabKeys[tabIndex] === selectedTabKey) {
        // In the very rare edge case of all tabs somehow being disabled, we need to set this tablist to become disabled to prevent users from keyboarding in
        setAllTabsDisabled(true);
      } else {
        const ref = tabRefMap[tabKeys[tabIndex]];
        setFocusedTabRef(ref);
      }
    }
    // Disable exhaustive-deps warning because this hook should only run once 'isSelectedTabDisabled' dependency changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelectedTabDisabled]);

  return {
    props: {
      ...props,
      accessible: accessible ?? true,
      accessibilityState: getAccessibilityState(disabled || allTabsDisabled, accessibilityState),
      accessibilityRole: 'tablist',
      appearance: appearance,
      componentRef: componentRef,
      defaultTabbableElement: focusedTabRef,
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
      canShowAnimatedIndicator: !!(userDefinedAnimatedIndicatorStyles && listLayoutMap && listLayoutMap[selectedTabKey]),
      disabled: disabled || allTabsDisabled,
      invoked: invoked,
      layout: {
        tablist: tabListLayout,
        tabs: listLayoutMap,
      },
      onTabSelect: data.onKeySelect,
      removeTabKey: removeTabKey,
      selectedKey: selectedTabKey,
      setFocusedTabRef: setFocusedTabRef,
      setInvoked: setInvoked,
      size: size,
      tabKeys: tabKeys,
      vertical: vertical,
      updateAnimatedIndicatorStyles: updateStyles,
      updateDisabledTabs,
      updateTabRef,
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
