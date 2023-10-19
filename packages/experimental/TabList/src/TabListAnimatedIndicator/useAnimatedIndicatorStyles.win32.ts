import React from 'react';
import type { ViewStyle } from 'react-native';

import type { AnimatedIndicatorProps, AnimatedIndicatorStyles, TabLayoutInfo } from './TabListAnimatedIndicator.types';

/**
 * This hook handles logic for generating the styles for the TabList's Animated Indicator.
 */
export function useAnimatedIndicatorStyles(props: AnimatedIndicatorProps): AnimatedIndicatorStyles {
  const { animatedIndicatorStyles, selectedKey, tabLayout, vertical } = props;

  const selectedIndicatorLayout = React.useMemo<TabLayoutInfo | null>(() => {
    return selectedKey ? tabLayout[selectedKey] : null;
  }, [selectedKey, tabLayout]);

  // Calculate styles using both layout information and user defined styles
  const styles = React.useMemo<AnimatedIndicatorStyles | null>(() => {
    // if not all layout props have been recorded for the current selected indicator, don't render the animated indicator
    if (!selectedIndicatorLayout) {
      return null;
    }
    const { x, y, width, height, startMargin, tabBorderWidth } = selectedIndicatorLayout;
    const containerStyles: ViewStyle = {
      position: 'absolute',
      ...animatedIndicatorStyles.container,
    };
    const indicatorStyles = {
      borderRadius: 99,
      ...animatedIndicatorStyles.indicator,
      width: width,
      height: height,
    };
    if (vertical) {
      containerStyles.start = x + tabBorderWidth + 1;
      indicatorStyles.top = y + startMargin + tabBorderWidth + 1;
    } else {
      containerStyles.bottom = height + y + 1;
      indicatorStyles.start = x + startMargin + tabBorderWidth + 1;
    }
    return {
      container: containerStyles,
      indicator: indicatorStyles,
    };
  }, [vertical, selectedIndicatorLayout, animatedIndicatorStyles]);

  return styles;
}
