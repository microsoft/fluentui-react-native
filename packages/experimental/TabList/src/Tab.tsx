/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Tab.styling';
import type { TabType, TabProps } from './Tab.types';
import { tabName } from './Tab.types';
import { useTab } from './useTab';

export const Tab = compose<TabType>({
  displayName: tabName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    stack: View,
    icon: Icon,
    indicator: View,
    content: Text,
  },
  useRender: (userProps: TabProps, useSlots: UseSlots<TabType>) => {
    const tabsItem = useTab(userProps);

    const iconProps = createIconProps(userProps.icon);

    // Grab the styled slots.
    const Slots = useSlots(userProps, (layer) => tabsItem.state[layer] || userProps[layer]);

    // Return the handler to finish render.
    return (final: TabProps, ...children: React.ReactNode[]) => {
      if (!tabsItem.state) {
        return null;
      }

      const { icon, itemKey, itemCount, headerText, ...mergedProps } = mergeProps(tabsItem.props, final);

      let containerText: string | null = null;
      React.Children.forEach(children, (child) => {
        if (typeof child === 'string') {
          containerText = child;
        }
      });

      return (
        <Slots.root {...mergedProps}>
          <Slots.stack>
            {icon && <Slots.icon {...iconProps} />}
            <Slots.content key="content">{containerText}</Slots.content>
          </Slots.stack>
          <Slots.indicator />
        </Slots.root>
      );
    };
  },
});

export default Tab;
