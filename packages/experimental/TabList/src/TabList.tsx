/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './TabList.styling';
import type { TabListType, TabListProps, TabListContextData } from './TabList.types';
import { tabListName } from './TabList.types';
import { useTabList } from './useTabList';

export const TabListContext = React.createContext<TabListContextData>({
  selectedKey: null,
  onTabsClick: (/* key: string */) => {
    return;
  },
  getTabId: (/* key:string, index: number*/) => {
    return null;
  },
  updateSelectedTabsItemRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  tabsItemKeys: [],
  views: null,
});

export const TabList = compose<TabListType>({
  displayName: tabListName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    label: Text,
    container: FocusZone,
    stack: View,
    tabPanel: View,
  },
  useRender: (userProps: TabListProps, useSlots: UseSlots<TabListType>) => {
    // configure props and state for tabs based on user props
    const tabs = useTabList(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps, (layer) => tabs.state[layer] || userProps[layer]);

    // Return the handler to finish render.
    return (final: TabListProps, ...children: React.ReactNode[]) => {
      if (!tabs.state) {
        return null;
      }

      const { label, defaultTabbableElement, isCircularNavigation, ...mergedProps } = mergeProps(tabs.props, final);

      // Populate the tabsItemKeys array.
      if (children) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        tabs.state.context.tabsItemKeys = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            // Sets default selected tabItem.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - TODO, fix typing error
            if (tabs.state?.context.selectedKey == null && !child.props.disabled) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore - TODO, fix typing error
              tabs.state.context.selectedKey = child.props.itemKey;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - TODO, fix typing error
            return child.props.itemKey;
          }
        });
      }

      return (
        <TabListContext.Provider
          // Passes in the selected key and a hook function to update the newly selected tabsItem and call the client's onTabsClick callback.
          value={tabs.state.context}
        >
          <Slots.root {...mergedProps}>
            {tabs?.state?.label && <Slots.label key="label">{label}</Slots.label>}
            <Slots.container defaultTabbableElement={defaultTabbableElement} isCircularNavigation={isCircularNavigation}>
              <Slots.stack>{children}</Slots.stack>
            </Slots.container>
            <Slots.tabPanel>
              <TabListContext.Consumer>
                {(context) => !tabs?.state?.headersOnly && <View>{context.views.get(context.selectedKey)}</View>}
              </TabListContext.Consumer>
            </Slots.tabPanel>
          </Slots.root>
        </TabListContext.Provider>
      );
    };
  },
});

export default TabList;
