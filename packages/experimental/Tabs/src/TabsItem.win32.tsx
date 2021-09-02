/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { TabItemType, TabsItemProps } from './TabsItem.types.win32';
import { tabsItemName } from './TabsItem.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './TabsItem.styling.win32';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useTabsItem } from './useTabsItem.win32';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { TabsContext } from './Tabs';

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
    // Grab the styled slots.
    const Slots = useSlots(userProps, layer => tabsItem.state[layer] || userProps[layer]);
    // Return the handler to finish render.
    return (final: TabsItemProps, ...children: React.ReactNode[]) => {
      const context = React.useContext(TabsContext);
      const { icon, itemKey, itemCount, headerText, testID, ...mergedProps } = mergeProps(tabsItem.props, final);

      let containerText = headerText;
      if (itemCount !== undefined) {
        containerText += ` (${itemCount})`;
      }

      const renderContent = !!headerText || itemCount !== undefined;
      context?.views?.set(itemKey, children);

      return (
        <Slots.root {...mergedProps}>
          <Slots.stack>
            {icon && <Slots.icon {...iconProps} />}
            {renderContent && (
              <Slots.content key="content" testID={testID}>
                {containerText}
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
