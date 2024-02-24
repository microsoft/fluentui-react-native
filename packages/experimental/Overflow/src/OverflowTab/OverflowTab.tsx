/** @jsxRuntime classic */
/** @jsx withSlots */
/** @jsxFrag */

import React from 'react';

import type { UseTokens } from '@fluentui-react-native/framework';
import { compressible, useFluentTheme, applyTokenLayers } from '@fluentui-react-native/framework';
import {
  renderTab,
  useTabSlotProps,
  useTabSlots,
  tabName,
  tabStates,
  useTabTokens,
  useTab,
  useTabAnimation,
  TabListContext,
} from '@fluentui-react-native/tablist';
import type { TabProps, TabState, TabTokens, TabListState } from '@fluentui-react-native/tablist';

import type { OverflowItemProps } from '../OverflowItem/OverflowItem.types';
import { useOverflowItem } from '../OverflowItem/useOverflowItem';

const tabLookup = (layer: string, state: TabState, props: TabProps, tablistContext: TabListState): boolean => {
  return (
    state[layer] ||
    props[layer] ||
    tablistContext[layer] ||
    layer === tablistContext.appearance ||
    layer === tablistContext.size ||
    (layer === 'hasIcon' && props.icon)
  );
};

export const OverflowTab = compressible<TabProps, TabTokens>((props: TabProps, useTokens: UseTokens<TabTokens>) => {
  const tablist = React.useContext(TabListContext);
  const tab = useTab(props);

  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  // Calculate component states to get the correct tokens here (this happens in useSlots for compose components)
  [tokens, cache] = applyTokenLayers(tokens, tabStates, cache, (layer) => tabLookup(layer, tab.state, tab.props, tablist));

  // Get styling props for each Tab slot
  const slotProps = useTabSlotProps(tab.props, tokens, theme, tablist);
  slotProps.root = useTabAnimation(props, tablist, tokens, slotProps.root);

  const initialOverflowItemProps = React.useMemo<OverflowItemProps<TabProps>>(
    () => ({
      ...tab.props,
      overflowID: props.tabKey,
      onLayout: slotProps.root.onLayout,
    }),
    [tab.props, props.tabKey, slotProps.root.onLayout],
  );
  const { props: overflowItemProps, state: overflowItemState } = useOverflowItem<TabProps>(initialOverflowItemProps);
  slotProps.root.onLayout = overflowItemProps.onLayout;

  const Slots = useTabSlots(slotProps);

  return (final: TabProps, ...children: React.ReactNode[]) =>
    overflowItemState.visible ? renderTab(Slots, tab, final, ...children) : null;
}, useTabTokens);
OverflowTab.displayName = tabName;

export default OverflowTab;
