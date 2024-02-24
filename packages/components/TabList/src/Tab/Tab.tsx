/** @jsxRuntime classic */
/** @jsx withSlots */
/** @jsxFrag */

import React from 'react';

import type { UseTokens } from '@fluentui-react-native/framework';
import { compressible, useFluentTheme, applyTokenLayers } from '@fluentui-react-native/framework';

import { renderTab } from './renderTab';
import { useTabSlotProps, useTabSlots } from './Tab.styling';
import { tabName } from './Tab.types';
import type { TabProps, TabState, TabTokens } from './Tab.types';
import { tabStates, useTabTokens } from './TabTokens';
import { useTab } from './useTab';
import { useTabAnimation } from './useTabAnimation';
import type { TabListState } from '../TabList/TabList.types';
import { TabListContext } from '../TabList/TabListContext';

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

export const Tab = compressible<TabProps, TabTokens>((props: TabProps, useTokens: UseTokens<TabTokens>) => {
  const tablist = React.useContext(TabListContext);
  const tab = useTab(props);

  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  // Calculate component states to get the correct tokens here (this happens in useSlots for compose components)
  [tokens, cache] = applyTokenLayers(tokens, tabStates, cache, (layer) => tabLookup(layer, tab.state, tab.props, tablist));

  // Get styling props for each Tab slot
  const slotProps = useTabSlotProps(tab.props, tokens, theme, tablist);
  slotProps.root = useTabAnimation(props, tablist, tokens, slotProps.root);

  const Slots = useTabSlots(slotProps);

  return (final: TabProps, ...children: React.ReactNode[]) => renderTab(Slots, tab, final, ...children);
}, useTabTokens);
Tab.displayName = tabName;

export default Tab;
