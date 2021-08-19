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
import { filterViewProps } from '@fluentui-react-native/adapters';
import { TabsContext } from './Tabs';
import { getPaletteFromTheme } from '@fluentui-react-native/tokens';

export const TabsItem = compose<TabItemType>({
  displayName: tabsItemName,
  ...stylingSettings,
  slots: {
    root: View,
    stack: View,
    icon: Icon,
    indicator: View,
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
      const { icon, headerText, itemKey, itemCount, testID, ...mergedProps } = mergeProps(tabsItem.props, final);
      console.log(itemCount);
      const countText = itemCount !== undefined ? ` (${itemCount})` : '';
      // Sets the view that belongs to a TabItem
      // console.log(itemKey, children);
      context.views.set(itemKey, children);

      return (
        <Slots.root {...mergedProps}>
          <Slots.stack>
            {icon && <Slots.icon {...iconProps} />}
            {headerText && (
              <Slots.content key="content" testID={testID}>
                {headerText + countText}
              </Slots.content>
            )}
          </Slots.stack>
          <Slots.indicator />
        </Slots.root>
      );
    };
  },
});

export default TabsItem;
