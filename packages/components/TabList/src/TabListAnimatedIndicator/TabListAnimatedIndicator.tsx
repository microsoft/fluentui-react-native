/** @jsxRuntime classic */
import React from 'react';
import { Animated } from 'react-native';

import { stagedComponent } from '@fluentui-react-native/framework';

import type { AnimatedIndicatorProps } from './TabListAnimatedIndicator.types';
import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';
import { useAnimatedIndicatorStyles } from './useAnimatedIndicatorStyles';

export const TabListAnimatedIndicator = stagedComponent<AnimatedIndicatorProps>((props) => {
  const styles = useAnimatedIndicatorStyles(props);
  return () => {
    return <Animated.View style={styles} />;
  };
});
TabListAnimatedIndicator.displayName = tablistAnimatedIndicatorName;

export default TabListAnimatedIndicator;
