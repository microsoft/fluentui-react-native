/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './TabList.styling';
import type { TabListType, TabListProps, TabListContextData } from './TabList.types';
import { tabListName } from './TabList.types';
import { useTabList } from './useTabList';

export const TabListContext = React.createContext<TabListContextData>({
  selectedKey: '',
  onTabSelect: () => {
    return;
  },
  updateSelectedTabsItemRef: () => {
    return;
  },
  tabKeys: [],
});

export const TabList = compose<TabListType>({
  displayName: tabListName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    container: FocusZone,
    stack: View,
  },
  useRender: (userProps: TabListProps, useSlots: UseSlots<TabListType>) => {
    // configure props and state for tabs based on user props
    const tabs = useTabList(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps, (layer) => tabs.state[layer] || userProps[layer]);

    // Return the handler to finish render.
    return () => {
      return <Slots.root></Slots.root>;
    };
  },
});

export default TabList;
