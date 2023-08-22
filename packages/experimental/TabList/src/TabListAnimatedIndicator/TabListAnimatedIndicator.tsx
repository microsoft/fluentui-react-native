/** @jsxRuntime classic */

import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

import { stagedComponent, mergeProps } from '@fluentui-react-native/framework';

import type { TabListAnimatedIndicatorProps } from './TabListAnimatedIndicator.types';
import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';

export const TabListAnimatedIndicator = stagedComponent((props: TabListAnimatedIndicatorProps) => {
  return (final: TabListAnimatedIndicatorProps) => {
    const { styles, ...finalProps } = final;
    const rootProps = mergeProps(props, finalProps, { style: styles.container });
    const indicatorProps = { animationClass: 'Ribbon_TabUnderline', style: styles.indicator } as ViewProps;
    return (
      <View {...rootProps}>
        <View {...indicatorProps} />
      </View>
    );
  };
});
TabListAnimatedIndicator.displayName = tablistAnimatedIndicatorName;

export default TabListAnimatedIndicator;
