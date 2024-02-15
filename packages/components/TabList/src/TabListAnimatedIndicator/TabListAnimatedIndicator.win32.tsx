/** @jsxRuntime classic */

import React from 'react';
import { View } from 'react-native';
import type { Animated, ViewProps, ViewStyle } from 'react-native';

import { stagedComponent, memoize } from '@fluentui-react-native/framework';

import type { AnimatedIndicatorProps } from './TabListAnimatedIndicator.types';
import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';
import { useAnimatedIndicatorStyles } from './useAnimatedIndicatorStyles';

const getIndicatorProps = memoize(indicatorPropsWorker);
function indicatorPropsWorker(animationClass: string, style: Animated.AnimatedProps<ViewStyle>): ViewProps {
  return { animationClass, style } as ViewProps;
}

/**
 * This component renders as the indicator for the selected tab. Its styles are manually calculated using
 * changing layout stored in the tablist context, so it doesn't need to use the compose or compressible franework.
 */
export const TabListAnimatedIndicator = stagedComponent<AnimatedIndicatorProps>((props) => {
  const styles = useAnimatedIndicatorStyles(props);
  return () => {
    const indicatorProps = getIndicatorProps('Ribbon_TabUnderline', styles);
    return <View {...indicatorProps} />;
  };
});
TabListAnimatedIndicator.displayName = tablistAnimatedIndicatorName;

export default TabListAnimatedIndicator;
