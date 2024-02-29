/** @jsxRuntime classic */
import * as React from 'react';
import { View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';
import { renderTabList, tabListName, useTabList, tablistStylingSettings as stylingSettings } from '@fluentui-react-native/tablist';

import type { OverflowTabListProps, OverflowTabListType } from './OverflowTabList.types';
import type { OverflowProps } from '../Overflow/Overflow.types';
import { useOverflow } from '../Overflow/useOverflow';
import { OverflowContext } from '../OverflowContext';

export const OverflowTabList = compose<OverflowTabListType>({
  displayName: tabListName,
  ...stylingSettings,
  slots: {
    container: FocusZone,
    stack: View,
    root: View,
  },
  useRender: (userProps: OverflowTabListProps, useSlots: UseSlots<OverflowTabListType>) => {
    // configure props and state for tabs based on user props
    const tablist = useTabList(userProps);

    const overflowProps = React.useMemo<OverflowProps>(
      () => ({
        dontHideBeforeReady: userProps.dontHideBeforeReady,
        itemIDs: userProps.tabKeys,
        onLayout: tablist.props.onLayout,
      }),
      [userProps.dontHideBeforeReady, userProps.tabKeys, tablist.props.onLayout],
    );

    const overflow = useOverflow(overflowProps);

    tablist.props.onLayout = overflow.props.onLayout;

    // Grab the styled slots.
    const Slots = useSlots(userProps);

    // Return the handler to finish render.
    return (final: OverflowTabListProps, ...children: React.ReactNode[]) => (
      <OverflowContext.Provider value={overflow.state}>{renderTabList(Slots, tablist, final, ...children)}</OverflowContext.Provider>
    );
  },
});

export default OverflowTabList;
