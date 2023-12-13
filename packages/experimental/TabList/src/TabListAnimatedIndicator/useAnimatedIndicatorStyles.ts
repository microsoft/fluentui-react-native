import React from 'react';
import { Animated, Easing, I18nManager } from 'react-native';

import type { AnimatedIndicatorProps, AnimatedIndicatorStyles } from './TabListAnimatedIndicator.types';

/**
 * This hook handles logic for generating the styles for the TabList's Animated Indicator. Child Tabs add layout update events to state
 * variables here, which we use to either directly update the layout values of the animated indicator (on win32) or generate the transforms
 * to move the indicator (on non-win32 platforms).
 */
export function useAnimatedIndicatorStyles(props: AnimatedIndicatorProps): AnimatedIndicatorStyles {
  const { animatedIndicatorStyles: additionalStyles, selectedKey, tabLayout, vertical } = props;

  // animated values
  const indicatorTranslate = React.useRef(new Animated.Value(0)).current;
  const indicatorScale = React.useRef(new Animated.Value(1)).current;

  // Save the initial selected layout, this shouldn't update after the first render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startingKey = React.useMemo(() => selectedKey, []);

  React.useEffect(() => {
    const startingIndicatorLayout = tabLayout[startingKey];
    const selectedIndicatorLayout = tabLayout[selectedKey];
    if (startingIndicatorLayout && selectedIndicatorLayout) {
      /**
       * Calculate transforms. Because the scale transform's origin is at the center, we need to calculate an extra offset to add to the
       * translate transform to place the indicator at the correct location on screen.
       */
      let scaleValue: number, translateValue: number, translateOffset: number;
      if (vertical) {
        scaleValue = selectedIndicatorLayout.height / startingIndicatorLayout.height;
        translateOffset = (selectedIndicatorLayout.height - startingIndicatorLayout.height) / 2;
        translateValue = selectedIndicatorLayout.y - startingIndicatorLayout.y;
      } else {
        scaleValue = selectedIndicatorLayout.width / startingIndicatorLayout.width;
        translateOffset = (selectedIndicatorLayout.width - startingIndicatorLayout.width) / 2;
        translateValue = selectedIndicatorLayout.x - startingIndicatorLayout.x;
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
    // This hook should only run when (1) the selected key / vertical prop changes and (2) whenever the tabLayout map changes because that implies an
    // extent change among the tabs: specifically whenever the selected tab is bolded and previously selected tab is unbolded. Without checking for #2,
    // the animation for scaling and translating the indicator uses outdated layout info, resulting in a unaligned, small indicator. All other dependencies
    // are irrelevant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, tabLayout, vertical]);

  // Calculate styles using both layout information and user defined styles
  const styles = React.useMemo<AnimatedIndicatorStyles>(() => {
    const { x, y, width, height } = tabLayout[startingKey];
    /**
     * Currently the behavior of layout style props and RTL differs between mac and win32. On mac, RTL = true simply swaps `right` and `left`. This should have been
     * removed per this: https://reactnative.dev/blog/2017/11/06/react-native-monthly-5#:~:text=The%20meaning%20of,opt%20into%20them.
     *
     * Because this is still in place, we account for the swap with the ternary operator below.
     * TODO: once mac RTL styling is fixed, remove the ternary operator.
     */
    const indicatorStyles: AnimatedIndicatorStyles = {
      ...additionalStyles,
      position: 'absolute',
      height: height,
      width: width,
      top: y,
      [I18nManager.isRTL ? 'right' : 'left']: x,
    };
    if (vertical) {
      indicatorStyles.transform = [{ translateY: indicatorTranslate }, { scaleY: indicatorScale }];
    } else {
      indicatorStyles.transform = [{ translateX: indicatorTranslate }, { scaleX: indicatorScale }];
    }
    return indicatorStyles;
  }, [additionalStyles, indicatorScale, indicatorTranslate, startingKey, tabLayout, vertical]);

  return styles;
}
