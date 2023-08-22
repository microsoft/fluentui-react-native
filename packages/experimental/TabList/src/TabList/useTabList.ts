import * as React from 'react';
import type { View, AccessibilityState, ViewStyle } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';
import type { LayoutRectangle } from '@office-iss/react-native-win32';

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
  const [listLayout, setListLayout] = React.useState<ListLayoutInfo>({});
  const [stackLayoutRect, setStackLayoutRect] = React.useState<LayoutRectangle>();
  const [userDefinedAnimatedIndicatorStyles, setUserDefinedAnimatedIndicatorStyles] = React.useState<
    Partial<AnimatedIndicatorState['styles']>
  >({});

  const addToLayoutMap = React.useCallback(
    (tabKey: string, layoutInfo: TabLayoutInfo) => {
      setListLayout((prev) => ({ ...prev, [tabKey]: { ...prev[tabKey], ...layoutInfo } }));
    },
    [setListLayout],
  );

  const onStackLayout = React.useCallback((e: LayoutEvent) => {
    if (e.nativeEvent.layout) {
      setStackLayoutRect(e.nativeEvent.layout);
    }
  }, []);

  const selectedIndicatorLayout = React.useMemo<TabLayoutInfo | null>(() => {
    const key = selectedKey ?? data.selectedKey;
    return key ? listLayout[key] : null;
  }, [selectedKey, data.selectedKey, listLayout]);

  // Calculate styles using both layout information and user defined styles
  const animatedIndicatorStyles = React.useMemo<AnimatedIndicatorState['styles']>(() => {
    // if not all layout props have been recorded for the current selected indicator, don't render the animated indicator
    if (selectedIndicatorLayout) {
      const { x, y, width, height, startMargin, tabBorderWidth } = selectedIndicatorLayout;
      const layoutValuesAreReasonable = stackLayoutRect.width > 0 && selectedIndicatorLayout.height < stackLayoutRect.height;
      if (
        layoutValuesAreReasonable &&
        x !== undefined &&
        y !== undefined &&
        width !== undefined &&
        height !== undefined &&
        startMargin !== undefined &&
        tabBorderWidth !== undefined
      ) {
        const containerStyles: ViewStyle = {
          position: 'absolute',
          ...userDefinedAnimatedIndicatorStyles.container,
        };
        const indicatorStyles: ViewStyle = {
          borderRadius: 99,
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
  }, [vertical, selectedIndicatorLayout, userDefinedAnimatedIndicatorStyles, stackLayoutRect]);

  const state: TabListState = {
    context: {
      addTabKey: addTabKey,
      animatedIndicatorState: {
        addToLayoutMap: addToLayoutMap,
        layout: listLayout,
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
