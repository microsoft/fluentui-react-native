import React from 'react';
import type { ViewStyle } from 'react-native';

import type { AnimatedIndicatorStyles } from './TabListAnimatedIndicator.types';
import type { TabLayoutInfo } from '../TabList/TabList.types';
import { TabListContext } from '../TabList/TabListContext';

/**
 * This hook handles logic for generating the styles for the TabList's Animated Indicator.
 */
export function useAnimatedIndicatorStyles(): AnimatedIndicatorStyles {
  const { animatedIndicatorStyles, layout, selectedKey, setCanShowAnimatedIndicator, vertical } = React.useContext(TabListContext);

  const selectedIndicatorLayout = React.useMemo<TabLayoutInfo | null>(() => {
    return selectedKey ? layout.tabs[selectedKey] : null;
  }, [selectedKey, layout.tabs]);

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
    const indicatorStyles: ViewStyle = {
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

  /**
   * Until we have styles for the animated indicator, we show the Tab's "static indicator" for the selected key which is normally shown only on hover.
   * The `canShowAnimatedIndicator` variable is used to decide whether to render the selected tab's static indicator as transparent or as colored in Tab.styling.tsx.
   */
  React.useEffect(() => setCanShowAnimatedIndicator(styles !== null), [setCanShowAnimatedIndicator, styles]);

  return styles;
}
