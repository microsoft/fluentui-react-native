/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
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
    const tab = useTab(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps, (layer) => tab.state[layer] || userProps[layer]);

    // Return the handler to finish render.
    return (final: TabProps, ...children: React.ReactNode[]) => {
      if (!tab.state) {
        return null;
      }

      let text = '';
      React.Children.forEach(children, (child) => {
        if (typeof child === 'string') {
          text = child;
        }
      });

      const { icon, tabKey, ...mergedProps } = mergeProps(tab.props, final, { accessibilityLabel: final.accessibilityLabel || text });

      return (
        <Slots.root {...mergedProps}>
          <Slots.stack>
            {icon && <Slots.icon {...icon} />}
            <Slots.content>{text}</Slots.content>
          </Slots.stack>
          <Slots.indicator />
        </Slots.root>
      );
    };
  },
});

export default Tab;
