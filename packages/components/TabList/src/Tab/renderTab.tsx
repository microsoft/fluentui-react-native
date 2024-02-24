/** @jsxRuntime classic */
/** @jsx withSlots */
/** @jsxFrag */

import * as React from 'react';

import { withSlots, mergeProps } from '@fluentui-react-native/framework';
import type { Slots } from '@fluentui-react-native/framework';

import type { TabInfo, TabProps, TabSlotProps } from './Tab.types';

export function renderTab(Slots: Slots<TabSlotProps>, tab: TabInfo, final: TabProps, ...children: React.ReactNode[]) {
  if (!tab.state) {
    return null;
  }

  // Get label for Tab to use if there's no accessibilityLabel prop passed in.
  let label = '';
  let hasChildren = false;
  React.Children.forEach(children, (child) => {
    if (child !== null) {
      hasChildren = true;
      if (typeof child === 'string') {
        label = child;
      }
    }
  });

  const { icon, tabKey, ...mergedProps } = mergeProps(tab.props, final, {
    accessibilityLabel: tab.props.accessibilityLabel || final.accessibilityLabel || label,
  });

  if (__DEV__ && !hasChildren && !icon) {
    console.warn('A Tab component must render content. Children, an icon, or both should be passed in.');
  }

  return (
    <Slots.root {...mergedProps}>
      <Slots.stack>
        {icon && <Slots.icon {...icon} />}
        {hasChildren && (
          <Slots.contentContainer>
            {React.Children.map(children, (child, i) =>
              typeof child === 'string' ? (
                <Slots.content accessible={false} key={i}>
                  {child}
                </Slots.content>
              ) : (
                child
              ),
            )}
          </Slots.contentContainer>
        )}
      </Slots.stack>
      <Slots.indicatorContainer>
        <Slots.indicator />
      </Slots.indicatorContainer>
    </Slots.root>
  );
}
