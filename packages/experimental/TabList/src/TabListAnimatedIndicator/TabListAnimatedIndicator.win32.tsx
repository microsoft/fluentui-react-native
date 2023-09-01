/** @jsxRuntime classic */

import React from 'react';
import { View } from 'react-native';
import type { ViewProps, ViewStyle } from 'react-native';

import { stagedComponent, mergeProps, memoize } from '@fluentui-react-native/framework';

import type { TabListAnimatedIndicatorProps } from './TabListAnimatedIndicator.types';
import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';

const getIndicatorProps = memoize(indicatorPropsWorker);
function indicatorPropsWorker(animationClass: string, style: ViewStyle): ViewProps {
  return { animationClass, style } as ViewProps;
}

/**
 * This component renders as the indicator for the selected tab. Its styles are calculated and passed
 * from the useTabList hook, so it doesn't need to use the compose or compressible franework.
 */
export const TabListAnimatedIndicator = stagedComponent((props: TabListAnimatedIndicatorProps) => {
  return (final: TabListAnimatedIndicatorProps) => {
    const { styles, ...finalProps } = final;
    const rootProps = mergeProps(props, finalProps, { style: styles.container });
    const indicatorProps = getIndicatorProps('Ribbon_TabUnderline', styles.indicator);
    return (
      <View {...rootProps}>
        <View {...indicatorProps} />
      </View>
    );
  };
});
TabListAnimatedIndicator.displayName = tablistAnimatedIndicatorName;

export default TabListAnimatedIndicator;
