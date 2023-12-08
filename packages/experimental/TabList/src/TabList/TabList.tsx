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
    root: View,
  },
  useRender: (userProps: TabListProps, useSlots: UseSlots<TabListType>) => {
    // configure props and state for tabs based on user props
    const tablist = useTabList(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps);

    // Return the handler to finish render.
    return (final: TabListProps, ...children: React.ReactNode[]) => {
      if (!tablist.state) {
        return null;
      }

      const { disabled, defaultTabbableElement, isCircularNavigation, vertical, ...mergedProps } = mergeProps(tablist.props, final);

      const { animatedIndicatorStyles, canShowAnimatedIndicator, disabled: tablistDisabledState, layout, selectedKey } = tablist.state;

      return (
        <TabListContext.Provider
          // Passes in the selected key and a hook function to update the newly selected tab and call the client's onTabsClick callback.
          value={tablist.state}
        >
          <Slots.root {...mergedProps}>
            <Slots.container
              disabled={disabled || tablistDisabledState}
              defaultTabbableElement={defaultTabbableElement}
              focusZoneDirection={vertical ? 'vertical' : 'horizontal'}
              isCircularNavigation={isCircularNavigation}
            >
              <Slots.stack>{children}</Slots.stack>
              {canShowAnimatedIndicator && (
                <TabListAnimatedIndicator
                  animatedIndicatorStyles={animatedIndicatorStyles}
                  selectedKey={selectedKey}
                  tabLayout={layout.tabs}
                  vertical={vertical}
                />
              )}
            </Slots.container>
          </Slots.root>
        </TabListContext.Provider>
      );
    };
  },
});

export default TabList;
