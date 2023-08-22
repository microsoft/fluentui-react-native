import * as React from 'react';
import type { View, AccessibilityState, ViewStyle } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

import type { AnimatedIndicatorState, ListLayoutInfo, TabLayoutInfo } from './TabList.types';
import { type TabListProps, type TabListInfo, type TabListState } from './TabList.types';

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
  const [listLayoutInfo, setListLayoutInfo] = React.useState<ListLayoutInfo>({});
  const [userDefinedAnimatedIndicatorStyles, setUserDefinedAnimatedIndicatorStyles] = React.useState<
    Partial<AnimatedIndicatorState['styles']>
  >({});

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

  const addToLayoutMap = React.useCallback(
    (tabKey: string, layoutInfo: TabLayoutInfo) => {
      setListLayoutInfo((prev) => ({ ...prev, [tabKey]: { ...prev[tabKey], ...layoutInfo } }));
    },
    [setListLayoutInfo],
  );

  const selectedIndicatorLayout = React.useMemo<TabLayoutInfo | null>(() => {
    const key = selectedKey ?? data.selectedKey;
    return key ? listLayoutInfo[key] : null;
  }, [selectedKey, data.selectedKey, listLayoutInfo]);

  const animatedIndicatorStyles = React.useMemo<AnimatedIndicatorState['styles']>(() => {
    // if not all layout props have been recorded for the current selected indicator, don't render the animated indicator
    if (selectedIndicatorLayout) {
      const { x, y, width, height, startMargin, tabBorderWidth } = selectedIndicatorLayout;
      if (
        x !== undefined &&
        y !== undefined &&
        width !== undefined &&
        height !== undefined &&
        startMargin !== undefined &&
        tabBorderWidth !== undefined
      ) {
        // calculate styles here
        const containerStyles: ViewStyle = { ...userDefinedAnimatedIndicatorStyles.container };
        const indicatorStyles: ViewStyle = {
          ...userDefinedAnimatedIndicatorStyles.indicator,
          width: selectedIndicatorLayout.width,
          height: selectedIndicatorLayout.height,
        };
        if (vertical) {
          containerStyles.start = tabBorderWidth + 1;
          indicatorStyles.marginTop = selectedIndicatorLayout.y + selectedIndicatorLayout.startMargin + tabBorderWidth + 1;
        } else {
          containerStyles.bottom = height + y + 1;
          indicatorStyles.marginLeft = selectedIndicatorLayout.x + selectedIndicatorLayout.startMargin + tabBorderWidth + 1;
        }
        return {
          container: containerStyles,
          indicator: indicatorStyles,
        };
      }
    }
    return {
      container: { display: 'none' },
      indicator: { display: 'none' },
    };
  }, [vertical, selectedIndicatorLayout, userDefinedAnimatedIndicatorStyles]);

  const state: TabListState = {
    context: {
      addTabKey: addTabKey,
      animatedIndicatorState: {
        addToLayoutMap: addToLayoutMap,
        layout: listLayoutInfo,
        styles: animatedIndicatorStyles,
        updateStyles: setUserDefinedAnimatedIndicatorStyles,
      },
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
