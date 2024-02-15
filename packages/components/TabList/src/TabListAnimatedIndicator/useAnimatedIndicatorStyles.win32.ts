import React from 'react';
import type { LayoutRectangle } from 'react-native';

import type { AnimatedIndicatorProps, AnimatedIndicatorStyles } from './TabListAnimatedIndicator.types';

/**
 * This hook handles logic for generating the styles for the TabList's Animated Indicator.
 */
export function useAnimatedIndicatorStyles(props: AnimatedIndicatorProps): AnimatedIndicatorStyles {
  const { animatedIndicatorStyles: additionalStyles, selectedKey, tabLayout } = props;

  const selectedIndicatorLayout = React.useMemo<LayoutRectangle | null>(() => {
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
