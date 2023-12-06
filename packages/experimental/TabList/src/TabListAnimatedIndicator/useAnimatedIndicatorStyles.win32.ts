import React from 'react';

import type { AnimatedIndicatorProps, AnimatedIndicatorStyles, TabLayoutInfo } from './TabListAnimatedIndicator.types';

/**
 * This hook handles logic for generating the styles for the TabList's Animated Indicator.
 */
export function useAnimatedIndicatorStyles(props: AnimatedIndicatorProps): AnimatedIndicatorStyles {
  const { animatedIndicatorStyles: additionalStyles, selectedKey, tabLayout } = props;

  const selectedIndicatorLayout = React.useMemo<TabLayoutInfo | null>(() => {
    return selectedKey ? tabLayout[selectedKey] : null;
  }, [selectedKey, tabLayout]);

  // Calculate styles using both layout information and user defined styles
  const styles = React.useMemo<AnimatedIndicatorStyles | null>(() => {
    // if not all layout props have been recorded for the current selected indicator, don't render the animated indicator
    if (!selectedIndicatorLayout) {
      return null;
    }
    const { x, y, width, height } = selectedIndicatorLayout;
    const indicatorStyles: AnimatedIndicatorStyles = {
      ...additionalStyles,
      backgroundColor: 'red',
      position: 'absolute',
      width: width,
      height: height,
      left: x,
      top: y,
    };
    return indicatorStyles;
  }, [selectedIndicatorLayout, additionalStyles]);

  return styles;
}
