import React from 'react';
import { Animated } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { AnimatedIndicatorStyles } from './TabListAnimatedIndicator.types';
import type { TabLayoutInfo } from '../TabList/TabList.types';
import { TabListContext } from '../TabList/TabListContext';

/**
 * This hook handles logic for generating the styles for the TabList's Animated Indicator. Child Tabs add layout update events to state
 * variables here, which we use to either directly update the layout values of the animated indicator (on win32) or generate the transforms
 * to move the indicator (on non-win32 platforms).
 */
export function useAnimatedIndicatorStyles(): AnimatedIndicatorStyles {
  const { animatedIndicatorStyles, layout, selectedKey, setCanShowAnimatedIndicator, vertical } = React.useContext(TabListContext);

  // animated values
  const indicatorTranslate = React.useRef(new Animated.Value(0)).current;
  const indicatorScale = React.useRef(new Animated.Value(1)).current;

  const [startingIndicatorLayout, setStartingIndicatorLayout] = React.useState<TabLayoutInfo | null>(null);

  React.useEffect(() => {
    if (startingIndicatorLayout === null && layout.tabs[selectedKey]) {
      setStartingIndicatorLayout(layout.tabs[selectedKey]);
    }
  }, [selectedKey, layout.tabs, startingIndicatorLayout, setStartingIndicatorLayout]);

  React.useEffect(() => {
    const selectedIndicatorLayout = layout.tabs[selectedKey];
    if (startingIndicatorLayout && selectedIndicatorLayout) {
      /**
       * Calculate transforms. Because the scale transform's origin is at the center, we need to calculate an extra offset to add to the
       * translate transform to place the indicator at the correct location on screen.
       */
      let scaleValue: number, translateValue: number, translateOffset: number;
      if (vertical) {
        scaleValue = selectedIndicatorLayout.height / startingIndicatorLayout.height;
        translateValue = selectedIndicatorLayout.y - startingIndicatorLayout.y;
        translateOffset = (selectedIndicatorLayout.height - startingIndicatorLayout.height) / 2;
      } else {
        scaleValue = selectedIndicatorLayout.width / startingIndicatorLayout.width;
        translateValue = selectedIndicatorLayout.x - startingIndicatorLayout.x;
        translateOffset = (selectedIndicatorLayout.width - startingIndicatorLayout.width) / 2;
      }
      Animated.timing(indicatorScale, {
        toValue: scaleValue,
        duration: 200,
        useNativeDriver: false,
      }).start();
      Animated.timing(indicatorTranslate, {
        toValue: translateValue + translateOffset,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [indicatorScale, indicatorTranslate, layout.tabs, selectedKey, startingIndicatorLayout, vertical]);

  // Calculate styles using both layout information and user defined styles
  const styles = React.useMemo<AnimatedIndicatorStyles | null>(() => {
    // if not all layout props have been recorded for the current selected indicator, don't render the animated indicator
    if (!startingIndicatorLayout) {
      return null;
    }
    const { x, y, width, height, startMargin, tabBorderWidth } = startingIndicatorLayout;
    const containerStyles: ViewStyle = {
      position: 'absolute',
      ...animatedIndicatorStyles.container,
    };
    const indicatorStyles: ViewStyle = {
      borderRadius: 99,
      ...animatedIndicatorStyles.indicator,
      width: width,
      height: height,
    };
    if (vertical) {
      containerStyles.start = x + tabBorderWidth + 1;
      indicatorStyles.top = y + startMargin + tabBorderWidth + 1;
      indicatorStyles.transform = [{ scaleY: indicatorScale as any }, { translateY: indicatorTranslate as any }];
    } else {
      containerStyles.bottom = height + y + 1;
      indicatorStyles.start = x + startMargin + tabBorderWidth + 1;
      indicatorStyles.transform = [{ scaleX: indicatorScale as any }, { translateX: indicatorTranslate as any }];
    }
    return {
      container: containerStyles,
      indicator: indicatorStyles,
    };
  }, [
    startingIndicatorLayout,
    animatedIndicatorStyles.container,
    animatedIndicatorStyles.indicator,
    vertical,
    indicatorScale,
    indicatorTranslate,
  ]);

  /**
   * Until we have styles for the animated indicator, we show the Tab's "static indicator" for the selected key which is normally shown only on hover.
   * The `canShowAnimatedIndicator` variable is used to decide whether to render the selected tab's static indicator as transparent or as colored in Tab.styling.tsx.
   */
  React.useEffect(() => setCanShowAnimatedIndicator(styles !== null), [setCanShowAnimatedIndicator, styles]);

  return styles;
}
