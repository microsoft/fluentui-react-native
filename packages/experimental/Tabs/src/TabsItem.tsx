/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { tabsItemName, TabItemType, TabsItemProps } from './TabsItem.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './TabsItem.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useTabsItem } from './useTabsItem';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { TabsContext } from './Tabs';

export const TabsItem = compose<TabItemType>({
  displayName: tabsItemName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (userProps: TabsItemProps, useSlots: UseSlots<TabItemType>) => {
    const tabsItem = useTabsItem(userProps);
    const iconProps = createIconProps(userProps.icon);
    // grab the styled slots
    const Slots = useSlots(userProps, layer => tabsItem.state[layer] || userProps[layer]);
    // now return the handler for finishing render
    return (final: TabsItemProps, ...children: React.ReactNode[]) => {
      const context = React.useContext(TabsContext);
      const { icon, headerText, itemKey, ...mergedProps } = mergeProps(tabsItem.props, final);
      const marginBetween = {
        marginLeft: icon && headerText ? 10 : 0,
      };

      // Sets the view that belongs to a TabItem
      // console.log(itemKey, children);
      context.views.set(itemKey, children);

      return (
        <Slots.root {...mergedProps}>
          {icon && <Slots.icon {...iconProps} />}
          {headerText && (
            <Slots.content key="content" style={marginBetween}>
              {headerText}
            </Slots.content>
          )}
        </Slots.root>
      );
    };
  },
});

export default TabsItem;
