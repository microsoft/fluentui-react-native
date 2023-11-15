import React from 'react';
import { Animated, Easing } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { AnimatedIndicatorProps, AnimatedIndicatorStyles } from './TabListAnimatedIndicator.types';

/**
 * This hook handles logic for generating the styles for the TabList's Animated Indicator. Child Tabs add layout update events to state
 * variables here, which we use to either directly update the layout values of the animated indicator (on win32) or generate the transforms
 * to move the indicator (on non-win32 platforms).
 */
export function useAnimatedIndicatorStyles(props: AnimatedIndicatorProps): AnimatedIndicatorStyles {
  const { animatedIndicatorStyles, selectedKey, tabLayout, vertical } = props;

  // animated values
  const indicatorTranslate = React.useRef(new Animated.Value(0)).current;
  const indicatorScale = React.useRef(new Animated.Value(1)).current;

  // Save the initial selected layout, this shouldn't update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startingIndicatorLayout = React.useMemo(() => tabLayout[selectedKey], []);

  React.useEffect(() => {
    const selectedIndicatorLayout = tabLayout[selectedKey];
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
      Animated.parallel([
        Animated.timing(indicatorScale, {
          toValue: scaleValue,
          duration: 300,
          easing: Easing.bezier(0, 0, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(indicatorTranslate, {
          toValue: translateValue + translateOffset,
          duration: 300,
          easing: Easing.bezier(0, 0, 0, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [indicatorScale, indicatorTranslate, tabLayout, selectedKey, startingIndicatorLayout, vertical]);

  // Calculate styles using both layout information and user defined styles
  const styles = React.useMemo<AnimatedIndicatorStyles>(() => {
    const { x, y, width, height, startMargin, tabBorderWidth } = startingIndicatorLayout;
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
      indicatorStyles.transform = [{ translateY: indicatorTranslate }, { scaleY: indicatorScale }];
    } else {
      containerStyles.bottom = height + y + 1;
      indicatorStyles.start = x + startMargin + tabBorderWidth + 1;
      indicatorStyles.transform = [{ translateX: indicatorTranslate }, { scaleX: indicatorScale }];
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

  return styles;
}
