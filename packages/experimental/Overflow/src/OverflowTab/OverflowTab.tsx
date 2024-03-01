/** @jsxRuntime classic */
/** @jsx withSlots */
/** @jsxFrag */

import React from 'react';

import type { UseTokens } from '@fluentui-react-native/framework';
import { compressible, mergeProps, useFluentTheme, applyTokenLayers } from '@fluentui-react-native/framework';
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
import type { TabProps, TabState, TabTokens, TabListState, TabSlotProps } from '@fluentui-react-native/tablist';

import type { OverflowItemChangeHandler } from '../Overflow/Overflow.types';
import { useOverflowContext } from '../OverflowContext';
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
  const overflow = useOverflowContext();
  const tab = useTab(props);
  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  // Calculate component states to get the correct tokens here (this happens in useSlots for compose components)
  [tokens, cache] = applyTokenLayers(tokens, tabStates, cache, (layer) => tabLookup(layer, tab.state, tab.props, tablist));

  // Get styling props for each Tab slot
  const slotProps = useTabSlotProps(tab.props, tokens, theme, tablist);
  const rootProps = useTabAnimation(props, tablist, tokens, slotProps.root);

  // This should be put somewhere else later
  const [extraSlotProps, setExtraSlotProps] = React.useState<Partial<TabSlotProps>>();
  const [shouldBlurFocus, setShouldBlurFocus] = React.useState<boolean>(false);
  const onOverflowItemChange: OverflowItemChangeHandler = React.useCallback(
    (data) => {
      if (data.id === props.tabKey) {
        if (data.type === 'layout') {
          // set stack style
          setExtraSlotProps((prev) => ({
            ...prev,
            stack: {
              style: {
                maxWidth: data.newLayout ? data.newLayout.width : undefined,
              },
            },
            content: {
              numberOfLines: data.newLayout ? 1 : 0,
            },
          }));
        } else {
          // unfocus if we're focused
          if (tab.state.focused) {
            console.log('NEED TO BLUR');
            setShouldBlurFocus(true);
          }
        }
      }
    },
    [props.tabKey, tab.state.focused, overflow.overflowMenuRef],
  );
  for (const slot in extraSlotProps) {
    slotProps[slot] = mergeProps(slotProps[slot], extraSlotProps[slot]);
  }

  React.useEffect(() => {
    if (shouldBlurFocus) {
      if (tab.state.focused) {
        overflow.overflowMenuRef && overflow.overflowMenuRef.current.focus();
      } else {
        setShouldBlurFocus(false);
      }
    }
  }, [overflow.overflowMenuRef, shouldBlurFocus, tab.props.componentRef, tab.state.focused]);

  const initialOverflowItemProps = React.useMemo<OverflowItemProps<TabProps>>(
    () => ({
      ...tab.props,
      overflowID: props.tabKey,
      onLayout: rootProps.onLayout,
      onOverflowItemChange: onOverflowItemChange,
    }),
    [tab.props, props.tabKey, rootProps.onLayout, onOverflowItemChange],
  );
  const { props: overflowItemProps, state: overflowItemState } = useOverflowItem<TabProps>(initialOverflowItemProps);
  slotProps.root.onLayout = overflowItemProps.onLayout;

  const Slots = useTabSlots(slotProps);

  return (final: TabProps, ...children: React.ReactNode[]) =>
    overflowItemState.visible || shouldBlurFocus ? renderTab(Slots, tab, final, ...children) : null;
}, useTabTokens);
OverflowTab.displayName = tabName;

export default OverflowTab;
