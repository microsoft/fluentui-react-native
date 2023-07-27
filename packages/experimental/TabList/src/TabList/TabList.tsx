/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './TabList.styling';
import type { TabListType, TabListProps, TabListContextData } from './TabList.types';
import { tabListName } from './TabList.types';
import { useTabList } from './useTabList';

export const TabListContext = React.createContext<TabListContextData>({
  appearance: 'transparent',
  disabled: false,
  selectedKey: '',
  onTabSelect: () => {
    return;
  },
  updateSelectedTabRef: () => {
    return;
  },
  size: 'medium',
  tabKeys: [],
  vertical: false,
});

export const TabList = compose<TabListType>({
  displayName: tabListName,
  ...stylingSettings,
  slots: {
    container: FocusZone,
    stack: View,
  },
  useRender: (userProps: TabListProps, useSlots: UseSlots<TabListType>) => {
    // configure props and state for tabs based on user props
    const tabs = useTabList(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps);

    // Return the handler to finish render.
    return (final: TabListProps, ...children: React.ReactNode[]) => {
      if (!tabs.state) {
        return null;
      }

      const { disabled, defaultTabbableElement, isCircularNavigation, ...mergedProps } = mergeProps(tabs.props, final);

      // Populate the tabKeys array.
      if (children) {
        tabs.state.context.tabKeys = React.Children.map(children, (child: React.ReactNode) => {
          if (React.isValidElement(child)) {
            // Sets default selected tab.
            if (tabs.state?.context.selectedKey == null && !child.props.disabled) {
              tabs.state.context.selectedKey = child.props.tabKey;
            }
            return child.props.tabKey;
          }
        });
      }

      return (
        <TabListContext.Provider
          // Passes in the selected key and a hook function to update the newly selected tab and call the client's onTabsClick callback.
          value={tabs.state.context}
        >
          <Slots.container disabled={disabled} defaultTabbableElement={defaultTabbableElement} isCircularNavigation={isCircularNavigation}>
            <Slots.stack {...mergedProps}>{children}</Slots.stack>
          </Slots.container>
        </TabListContext.Provider>
      );
    };
  },
});

export default TabList;
