/** @jsxRuntime classic */
import React from 'react';
import { Animated } from 'react-native';

import { stagedComponent } from '@fluentui-react-native/framework';

import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';
import { useAnimatedIndicatorStyles } from './useAnimatedIndicatorStyles';

export const TabListAnimatedIndicator = stagedComponent(() => {
  const styles = useAnimatedIndicatorStyles();
  return () => {
    if (!styles) {
      return null;
    }
    return (
      <Animated.View style={styles.container}>
        <Animated.View style={styles.indicator} />
      </Animated.View>
    );
  };
});
TabListAnimatedIndicator.displayName = tablistAnimatedIndicatorName;

export default TabListAnimatedIndicator;
