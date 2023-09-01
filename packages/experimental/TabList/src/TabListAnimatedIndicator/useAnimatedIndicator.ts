import React from 'react';
import type { LayoutRectangle, ViewStyle } from 'react-native';

import { mergeStyles } from '@fluentui-react-native/framework';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';

import type {
  ListLayoutMap,
  AnimatedIndicatorStyles,
  TabLayoutInfo,
  AnimatedIndicatorStylesUpdate,
  UseAnimatedIndicatorReturn,
} from './TabListAnimatedIndicator.types';
import type { TabListProps } from '../TabList/TabList.types';

/**
 * This hook handles logic for generating the styles for the TabList's Animated Indicator. Child Tabs add layout update events to state
 * variables here, which we use to either directly update the layout values of the animated indicator (on win32) or generate the transforms
 * to move the indicator (on non-win32 platforms).
 */
export function useAnimatedIndicator(props: TabListProps, selectedKey?: string): UseAnimatedIndicatorReturn {
  const { vertical } = props;

  const [listLayoutMap, setListLayoutMap] = React.useState<ListLayoutMap>({});
  const [tabListLayout, setTabListLayout] = React.useState<LayoutRectangle>();
  const [userDefinedAnimatedIndicatorStyles, setUserDefinedAnimatedIndicatorStyles] = React.useState<AnimatedIndicatorStyles>({
    container: {},
    indicator: {},
  });

  const addTabLayout = (tabKey: string, layoutInfo: TabLayoutInfo) => {
    setListLayoutMap((prev) => ({ ...prev, [tabKey]: { ...prev[tabKey], ...layoutInfo } }));
  };

  const updateStyles = (update: AnimatedIndicatorStylesUpdate) =>
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

  const onTabListLayout = React.useCallback((e: LayoutEvent) => {
    if (e.nativeEvent.layout) {
      setTabListLayout(e.nativeEvent.layout);
    }
  }, []);

  const selectedIndicatorLayout = React.useMemo<TabLayoutInfo | null>(() => {
    return selectedKey ? listLayoutMap[selectedKey] : null;
  }, [selectedKey, listLayoutMap]);

  // Calculate styles using both layout information and user defined styles
  const styles = React.useMemo<AnimatedIndicatorStyles | null>(() => {
    // if not all layout props have been recorded for the current selected indicator, don't render the animated indicator
    if (selectedIndicatorLayout) {
      const { x, y, width, height, startMargin, tabBorderWidth } = selectedIndicatorLayout;
      const containerStyles: ViewStyle = {
        position: 'absolute',
        ...userDefinedAnimatedIndicatorStyles.container,
      };
      const indicatorStyles: ViewStyle = {
        borderRadius: 99,
        ...userDefinedAnimatedIndicatorStyles.indicator,
        width: width,
        height: height,
      };
      if (vertical) {
        containerStyles.start = x + tabBorderWidth + 1;
        indicatorStyles.marginTop = y + startMargin + tabBorderWidth + 1;
      } else {
        containerStyles.bottom = height + y + 1;
        indicatorStyles.marginLeft = x + startMargin + tabBorderWidth + 1;
      }
      return {
        container: containerStyles,
        indicator: indicatorStyles,
      };
    }
    return null;
  }, [vertical, selectedIndicatorLayout, userDefinedAnimatedIndicatorStyles]);

  return {
    addTabLayout,
    onTabListLayout,
    tabListLayout,
    styles,
    updateStyles,
  };
}
