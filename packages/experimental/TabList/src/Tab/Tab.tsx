/** @jsxRuntime classic */
/** @jsx withSlots */
/** @jsxFrag */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { IconV1 as Icon } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Tab.styling';
import type { TabType, TabProps, TabState } from './Tab.types';
import { tabName } from './Tab.types';
import { useTab } from './useTab';
import { TabIndicator } from '../TabIndicator/TabIndicator';
import { TabListContext } from '../TabList/TabList';
import type { TabListContextData } from '../TabList/TabList.types';

const tabLookup = (layer: string, state: TabState, props: TabProps, tablistContext: TabListContextData): boolean => {
  return (
    state[layer] ||
    props[layer] ||
    tablistContext[layer] ||
    layer === tablistContext.appearance ||
    layer === tablistContext.size ||
    (layer === 'hasIcon' && props.icon)
  );
};

export const Tab = compose<TabType>({
  displayName: tabName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    stack: View,
    icon: Icon,
    iconPadding: View,
    indicator: TabIndicator,
    content: Text,
  },
  useRender: (userProps: TabProps, useSlots: UseSlots<TabType>) => {
    const tab = useTab(userProps);

    const tablistContext = React.useContext(TabListContext);

    // Grab the styled slots.
    const Slots = useSlots(userProps, (layer) => tabLookup(layer, tab.state, tab.props, tablistContext));

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
            {text && <Slots.content>{text}</Slots.content>}
          </Slots.stack>
          <Slots.indicator />
        </Slots.root>
      );
    };
  },
});

export default Tab;
