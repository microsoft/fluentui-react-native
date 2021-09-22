/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { tabsName, TabsType, TabsProps, TabsContextData } from './Tabs.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Tabs.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
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
  focusZoneRef: null
});

export const Tabs = compose<TabsType>({
  displayName: tabsName,
  ...stylingSettings,
  slots: {
    root: View,
    label: Text,
    stack: View,
    tabPanel: View
  },
  render: (userProps: TabsProps, useSlots: UseSlots<TabsType>) => {
    // configure props and state for tabs based on user props
    const tabs = useTabs(userProps);

    if(!tabs.state) return null;

    // Grab the styled slots.
    const Slots = useSlots(userProps, layer => tabs.state[layer] || userProps[layer]);

    // const onKeyDown = (ev: any) => {
    //   if (ev.nativeEvent.key === 'ArrowRight' || ev.nativeEvent.key === 'ArrowLeft') {
    //     const length = tabs.state.enabledKeys.length;
    //     const currTabItemIndex = tabs.state.enabledKeys.findIndex(x => x == tabs.state.context.selectedKey)
    //     let newCurrTabItemIndex;
    //     if (ev.nativeEvent.key === 'ArrowRight') {
    //       if (tabs.props.isCircularNavigation || !(currTabItemIndex + 1 == length)) {
    //         newCurrTabItemIndex = (currTabItemIndex + 1) % length;
    //         tabs.state.context.selectedKey = tabs.state.enabledKeys[newCurrTabItemIndex];
    //         tabs.state.context.onTabsClick(tabs.state.context.selectedKey);
    //       }
    //     }
    //     else {
    //       if (tabs.props.isCircularNavigation || !(currTabItemIndex == 0)) {
    //         newCurrTabItemIndex = (currTabItemIndex - 1 + length) % length;
    //         tabs.state.context.selectedKey = tabs.state.enabledKeys[newCurrTabItemIndex];
    //         tabs.state.context.onTabsClick(tabs.state.context.selectedKey);
    //       }
    //     }
    //   }
    // };

    const stackProps = {
      focusable: true, ref: tabs.state.context.focusZoneRef, onKeyDown: tabs.props.onKeyDown
    };

    // Return the handler to finish render.
    return (final: TabsProps, ...children: React.ReactNode[]) => {
      const { label, ...mergedProps } = mergeProps(tabs.props, final);

      // Populate the tabsItemKeys array
      if (children) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        tabs.state.context.tabsItemKeys = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            return child.props.itemKey;
          }
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        tabs.state.enabledKeys = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            if (!child.props.disabled) {
              return child.props.itemKey;
            }
          }
        });

        /* Sets the default selected TabsItem if a TabsItem is hidden.
        The default selected Tabsitem is the first enabled TabsItem. */
        if (!tabs.state.enabledKeys.includes(tabs.state.context.selectedKey)) {
          tabs.state.context.selectedKey = tabs.state.enabledKeys[0] ?? null;
        }
      }

      return (
        <TabsContext.Provider
          // Passes in the selected key and a hook function to update the newly selected tabsItem and call the client's onTabsClick callback.
          value={tabs.state.context}
        >
          <Slots.root {...mergedProps}>
            {tabs?.state?.label && <Slots.label key="label">{label}</Slots.label>}
              <Slots.stack {...stackProps}>{children}</Slots.stack>
            <Slots.tabPanel>
                <TabsContext.Consumer>
                  {context => !tabs?.state?.headersOnly && <View>{context.views.get(context.selectedKey)}</View>}
                </TabsContext.Consumer>
            </Slots.tabPanel>
          </Slots.root>
        </TabsContext.Provider>
      );
    };
  },
});

export default Tabs;
