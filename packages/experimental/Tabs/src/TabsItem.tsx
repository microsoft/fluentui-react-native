/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { TabsContext } from './Tabs';
import { stylingSettings } from './TabsItem.styling';
import type { TabItemType, TabsItemProps } from './TabsItem.types';
import { tabsItemName } from './TabsItem.types';
import { useTabsItem } from './useTabsItem';

export const TabsItem = compose<TabItemType>({
  displayName: tabsItemName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    stack: View,
    icon: Icon,
    indicator: View,
    content: Text,
  },
  useRender: (userProps: TabsItemProps, useSlots: UseSlots<TabItemType>) => {
    const tabsItem = useTabsItem(userProps);

    const iconProps = createIconProps(userProps.icon);
    const context = React.useContext(TabsContext);

    // Grab the styled slots.
    const Slots = useSlots(userProps, (layer) => tabsItem.state[layer] || userProps[layer]);
    // Return the handler to finish render.
    return (final: TabsItemProps, ...children: React.ReactNode[]) => {
      if (!tabsItem.state) {
        return null;
      }

      const { icon, itemKey, itemCount, headerText, ...mergedProps } = mergeProps(tabsItem.props, final);

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
            {renderContent && <Slots.content key="content">{containerText}</Slots.content>}
          </Slots.stack>
          <Slots.indicator />
        </Slots.root>
      );
    };
  },
});

export default TabsItem;
