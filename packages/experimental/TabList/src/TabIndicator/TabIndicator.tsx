/** @jsxRuntime classic */
/** @jsx withSlots */
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './TabIndicator.styling';
import type { TabIndicatorProps, TabIndicatorType } from './TabIndicator.types';
import { tabIndicatorName } from './TabIndicator.types';
// import { useTabIndicator } from './useTabIndicator';

export const TabIndicator = compose<TabIndicatorType>({
  displayName: tabIndicatorName,
  ...stylingSettings,
  slots: {
    root: View,
    indicator: View,
  },
  useRender: (userProps: TabIndicatorProps, useSlots: UseSlots<TabIndicatorType>) => {
    // const props = useTabIndicator(userProps);
    const Slots = useSlots(userProps);

    return (final: TabIndicatorProps) => {
      const { onLayout, ...mergedProps } = mergeProps(userProps, final);
      return (
        <Slots.root {...mergedProps}>
          <Slots.indicator onLayout={onLayout} />
        </Slots.root>
      );
    };
  },
});
