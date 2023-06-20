/** @jsxRuntime classic */
/** @jsx withSlots */
import { Pressable, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, withSlots } from '@fluentui-react-native/framework';
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
    const tabsItem = useTab(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps, (layer) => tabsItem.state[layer] || userProps[layer]);

    // Return the handler to finish render.
    return () => {
      return <Slots.root></Slots.root>;
    };
  },
});

export default Tab;
