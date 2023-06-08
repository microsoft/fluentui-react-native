/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Tabs.styling';
import type { TabsType, TabsProps, TabsContextData } from './Tabs.types';
import { tabsName } from './Tabs.types';
import { useTabs } from './useTabs';

export const TabsContext = React.createContext<TabsContextData>({
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

export const Tabs = compose<TabsType>({
  displayName: tabsName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    label: Text,
    container: FocusZone,
    stack: View,
    tabPanel: View,
  },
  useRender: (userProps: TabsProps, useSlots: UseSlots<TabsType>) => {
    // configure props and state for tabs based on user props
    const tabs = useTabs(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps, (layer) => tabs.state[layer] || userProps[layer]);

    // Return the handler to finish render.
    return (final: TabsProps, ...children: React.ReactNode[]) => {
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
        <TabsContext.Provider
          // Passes in the selected key and a hook function to update the newly selected tabsItem and call the client's onTabsClick callback.
          value={tabs.state.context}
        >
          <Slots.root {...mergedProps}>
            {tabs?.state?.label && <Slots.label key="label">{label}</Slots.label>}
            <Slots.container defaultTabbableElement={defaultTabbableElement} isCircularNavigation={isCircularNavigation}>
              <Slots.stack>{children}</Slots.stack>
            </Slots.container>
            <Slots.tabPanel>
              <TabsContext.Consumer>
                {(context) => !tabs?.state?.headersOnly && <View>{context.views.get(context.selectedKey)}</View>}
              </TabsContext.Consumer>
            </Slots.tabPanel>
          </Slots.root>
        </TabsContext.Provider>
      );
    };
  },
});

export default Tabs;
