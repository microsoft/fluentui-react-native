/** @jsxRuntime classic */
/** @jsx withSlots */
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './TabIndicator.styling';
import type { TabIndicatorProps, TabIndicatorType } from './TabIndicator.types';
import { tabIndicatorName } from './TabIndicator.types';

export const TabIndicator = compose<TabIndicatorType>({
  displayName: tabIndicatorName,
  ...stylingSettings,
  slots: {
    root: View,
    indicator: View,
  },
  useRender: (userProps: TabIndicatorProps, useSlots: UseSlots<TabIndicatorType>) => {
    const Slots = useSlots(userProps);

    return (final: TabIndicatorProps) => {
      const mergedProps = mergeProps(userProps, final);
      return (
        <Slots.root {...mergedProps}>
          <Slots.indicator />
        </Slots.root>
      );
    };
  },
});
