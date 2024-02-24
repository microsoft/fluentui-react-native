/** @jsxRuntime classic */
import { View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';

import { renderTabList } from './renderTabList';
import { stylingSettings } from './TabList.styling';
import type { TabListType, TabListProps } from './TabList.types';
import { tabListName } from './TabList.types';
import { useTabList } from './useTabList';

export const TabList = compose<TabListType>({
  displayName: tabListName,
  ...stylingSettings,
  slots: {
    container: FocusZone,
    stack: View,
    root: View,
  },
  useRender: (userProps: TabListProps, useSlots: UseSlots<TabListType>) => {
    // configure props and state for tabs based on user props
    const tablist = useTabList(userProps);

    // Grab the styled slots.
    const Slots = useSlots(userProps);

    // Return the handler to finish render.
    return (final: TabListProps, ...children: React.ReactNode[]) => renderTabList(Slots, tablist, final, ...children);
  },
});

export default TabList;
