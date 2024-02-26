/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';

import { mergeProps, withSlots } from '@fluentui-react-native/framework';
import type { Slots } from '@fluentui-react-native/framework';

import type { TabListInfo, TabListProps, TabListSlotProps } from './TabList.types';
import { TabListContext } from './TabListContext';
import TabListAnimatedIndicator from '../TabListAnimatedIndicator/TabListAnimatedIndicator';

export function renderTabList(Slots: Slots<TabListSlotProps>, tablist: TabListInfo, final: TabListProps, ...children: React.ReactNode[]) {
  if (!tablist.state) {
    return null;
  }

  const { disabled, defaultTabbableElement, isCircularNavigation, vertical, ...mergedProps } = mergeProps(tablist.props, final);

  const { animatedIndicatorStyles, canShowAnimatedIndicator, disabled: tablistDisabledState, layout, selectedKey } = tablist.state;

  return (
    <TabListContext.Provider
      // Passes in the selected key and a hook function to update the newly selected tab and call the client's onTabsClick callback.
      value={tablist.state}
    >
      <Slots.root {...mergedProps}>
        <Slots.container
          disabled={disabled || tablistDisabledState}
          defaultTabbableElement={defaultTabbableElement}
          focusZoneDirection={vertical ? 'vertical' : 'horizontal'}
          isCircularNavigation={isCircularNavigation}
        >
          <Slots.stack>{children}</Slots.stack>
          {canShowAnimatedIndicator && (
            <TabListAnimatedIndicator
              animatedIndicatorStyles={animatedIndicatorStyles}
              selectedKey={selectedKey}
              tabLayout={layout.tabs}
              vertical={vertical}
            />
          )}
        </Slots.container>
      </Slots.root>
    </TabListContext.Provider>
  );
}
