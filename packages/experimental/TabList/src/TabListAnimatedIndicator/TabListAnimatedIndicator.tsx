import * as React from 'react';
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';

import { stylingSettings } from './TabListAnimatedIndicator.styling';
import type { TabListAnimatedIndicatorProps, TabListAnimatedIndicatorType } from './TabListAnimatedIndicator.types';
import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';
import { useTabListAnimatedIndicator } from './useTabListAnimatedIndicator';

export const TabListAnimatedIndicator = compose<TabListAnimatedIndicatorType>({
  displayName: tablistAnimatedIndicatorName,
  slots: {
    root: View,
    indicator: View,
  },
  useRender: (userProps: TabListAnimatedIndicatorProps, useSlots: UseSlots<TabListAnimatedIndicatorType>) => {
    const { style, ...props } = useTabListAnimatedIndicator(userProps);
    const Slots = useSlots(userProps);
    return (final: TabListAnimatedIndicatorProps) => {
      const mergedProps = mergeProps(props, final, {
        style: {
          position: 'absolute',
          bottom: 0,
          left: 0,
        },
      });
      return (
        <Slots.root {...mergedProps}>
          <Slots.indicator style={style} />
        </Slots.root>
      );
    };
  },
});
