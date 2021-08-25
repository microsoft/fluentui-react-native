/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { tabsName, TabsType, TabsProps, TabsContextData } from './Tabs.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Tabs.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useTabs } from './useTabs';
import { FocusZone } from '@fluentui-react-native/focus-zone';

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
    root: View,
    label: Text,
    container: FocusZone,
    stack: View,
    tabPanel: View,
  },
  render: (userProps: TabsProps, useSlots: UseSlots<TabsType>) => {
    const tabs = useTabs(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, layer => tabs.state[layer] || userProps[layer]);
    // now return the handler for finishing render
    return (final: TabsProps, ...children: React.ReactNode[]) => {
      const { label, defaultTabbableElement, isCircularNavigation, ...mergedProps } = mergeProps(tabs.props, final); // ...mergedProps

      // Populate the tabsItemKeys array
      if (children) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        tabs.state.context.tabsItemKeys = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            // Sets default selected tabItem
            if (tabs.state.context.selectedKey == null && !child.props.disabled) {
              tabs.state.context.selectedKey = child.props.itemKey;
            }
            return child.props.itemKey;
          }
        });
      }

      return (
        <TabsContext.Provider
          // Passes in the selected key and a hook function to update the newly selected tabsItem and call the client's onTabsClick callback
          value={tabs.state.context}
        >
          <Slots.root {...mergedProps}>
            {tabs?.state?.info?.label && <Slots.label key="label">{label}</Slots.label>}
            <Slots.container defaultTabbableElement={defaultTabbableElement} isCircularNavigation={isCircularNavigation}>
              <Slots.stack>{children}</Slots.stack>
            </Slots.container>
            <Slots.tabPanel>
              {
                <TabsContext.Consumer>
                  {context => !tabs?.state?.info?.headersOnly && <View>{context.views.get(context.selectedKey)}</View>}
                </TabsContext.Consumer>
              }
            </Slots.tabPanel>
          </Slots.root>
        </TabsContext.Provider>
      );
    };
  },
});

export default Tabs;
