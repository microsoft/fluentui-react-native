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

export const TabsItem = compose<TabItemType>({
  displayName: tabsItemName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (userProps: TabsItemProps, useSlots: UseSlots<TabItemType>) => {
    const button = useTabsItem(userProps);
    const iconProps = createIconProps(userProps.icon);
    // grab the styled slots
    const Slots = useSlots(userProps, layer => button.state[layer] || userProps[layer]);
    // now return the handler for finishing render
    return (final: TabsItemProps, ...children: React.ReactNode[]) => {
      const { icon, content, ...mergedProps } = mergeProps(button.props, final);
      const marginBetween = {
        marginLeft: icon && content ? 10 : 0,
      };
      return (
        <Slots.root {...mergedProps}>
          {icon && <Slots.icon {...iconProps} />}
          {content && (
            <Slots.content key="content" style={marginBetween}>
              {content}
            </Slots.content>
          )}
          {children}
        </Slots.root>
      );
    };
  },
});

export default TabsItem;
