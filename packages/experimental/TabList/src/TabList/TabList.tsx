/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './TabList.styling';
import type { TabListType, TabListProps } from './TabList.types';
import { tabListName } from './TabList.types';
import { TabListContext } from './TabListContext';
import { useTabList } from './useTabList';
import TabListAnimatedIndicator from '../TabListAnimatedIndicator/TabListAnimatedIndicator';

export const TabList = compose<TabListType>({
  displayName: tabListName,
  ...stylingSettings,
  slots: {
    container: FocusZone,
    stack: View,
    animatedIndicator: TabListAnimatedIndicator,
  },
  useRender: (userProps: TabListProps, useSlots: UseSlots<TabListType>) => {
    // configure props and state for tabs based on user props
    const tabList = useTabList(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps);

    // Return the handler to finish render.
    return (final: TabListProps, ...children: React.ReactNode[]) => {
      if (!tabList.state) {
        return null;
      }

      const { disabled, defaultTabbableElement, isCircularNavigation, vertical, ...mergedProps } = mergeProps(tabList.props, final);

      // console.log('ddd');
      // console.log(tabList.state.context);

      return (
        <TabListContext.Provider
          // Passes in the selected key and a hook function to update the newly selected tab and call the client's onTabsClick callback.
          value={tabList.state.context}
        >
          <Slots.container
            disabled={disabled}
            defaultTabbableElement={defaultTabbableElement}
            focusZoneDirection={vertical ? 'vertical' : 'horizontal'}
            isCircularNavigation={isCircularNavigation}
          >
            <Slots.stack {...mergedProps}>{children}</Slots.stack>
            <Slots.animatedIndicator styles={tabList.state.context?.animatedIndicatorState?.styles} />
          </Slots.container>
        </TabListContext.Provider>
      );
    };
  },
});

export default TabList;
