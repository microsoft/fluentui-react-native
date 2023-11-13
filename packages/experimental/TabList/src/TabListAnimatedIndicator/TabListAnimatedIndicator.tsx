/** @jsxRuntime classic */
import React from 'react';
import { Animated, View } from 'react-native';

import { stagedComponent } from '@fluentui-react-native/framework';

import type { AnimatedIndicatorProps } from './TabListAnimatedIndicator.types';
import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';
import { useAnimatedIndicatorStyles } from './useAnimatedIndicatorStyles';

export const TabListAnimatedIndicator = stagedComponent<AnimatedIndicatorProps>((props) => {
  const styles = useAnimatedIndicatorStyles(props);
  return () => {
    return (
      <View style={styles.container}>
        <Animated.View style={styles.indicator} />
      </View>
    );
  };
});
TabListAnimatedIndicator.displayName = tablistAnimatedIndicatorName;

export default TabListAnimatedIndicator;
