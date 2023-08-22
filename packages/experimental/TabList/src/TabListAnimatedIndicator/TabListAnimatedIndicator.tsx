/** @jsxRuntime classic */
/** @jsx withSlots */

import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { withSlots, compose, mergeProps } from '@fluentui-react-native/framework';

import { stylingSettings } from './TabListAnimatedIndicator.styling';
import type { TabListAnimatedIndicatorProps, TabListAnimatedIndicatorType } from './TabListAnimatedIndicator.types';
import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';

export const TabListAnimatedIndicator = compose<TabListAnimatedIndicatorType>({
  displayName: tablistAnimatedIndicatorName,
  ...stylingSettings,
  slots: {
    root: View,
    indicator: View,
  },
  useRender: (userProps: TabListAnimatedIndicatorProps, useSlots: UseSlots<TabListAnimatedIndicatorType>) => {
    const Slots = useSlots(userProps, (layer) => userProps[layer]);
    return (final: TabListAnimatedIndicatorProps) => {
      const { styles, ...finalProps } = final;
      const mergedProps = mergeProps(userProps, finalProps, { style: styles.container });
      return (
        <Slots.root {...mergedProps}>
          <Slots.indicator animationClass="Ribbon_TabUnderline" style={styles.indicator} />
        </Slots.root>
      );
    };
  },
});

export default TabListAnimatedIndicator;
